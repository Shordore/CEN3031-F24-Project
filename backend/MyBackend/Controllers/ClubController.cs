// Controllers/ClubController.cs

using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ClubSwamp.Data;
using ClubSwamp.Models;
using ClubSwamp.Models.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubSwamp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClubController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Constructor injecting the AppDbContext for database operations
        public ClubController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Club
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClubResponse>>> GetClubs()
        {
            // Retrieve all clubs, including their members and associated user details
            var clubs = await _context.Clubs
                .Include(c => c.Members)
                    .ThenInclude(cm => cm.User)
                .ToListAsync();

            // Map each club entity to a ClubResponse DTO
            var response = clubs.Select(c => new ClubResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Categories = c.Categories,
                Members = c.Members.Select(m => new ClubMemberResponse
                {
                    UserId = m.UserId,
                    UFID = m.User.UFID,
                    Name = m.User.Name,
                    Role = m.Role.ToString()
                }).ToList()
            }).ToList();

            // Return the list of clubs
            return Ok(response);
        }

        // GET: api/Club/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ClubResponse>> GetClub(int id)
        {
            // Retrieve the club with the specified ID, including its members and associated user details
            var club = await _context.Clubs
                .Include(c => c.Members)
                    .ThenInclude(cm => cm.User)
                .FirstOrDefaultAsync(c => c.Id == id);

            // If the club doesn't exist, return a 404 Not Found response
            if (club == null)
                return NotFound(new { message = "Club not found." });

            // Map the club entity to a ClubResponse DTO
            var response = new ClubResponse
            {
                Id = club.Id,
                Name = club.Name,
                Description = club.Description,
                Categories = club.Categories,
                Members = club.Members.Select(m => new ClubMemberResponse
                {
                    UserId = m.UserId,
                    UFID = m.User.UFID,
                    Name = m.User.Name,
                    Role = m.Role.ToString()
                }).ToList()
            };

            // Return the club details
            return Ok(response);
        }

        // GET: api/Club/search?query=...
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ClubResponse>>> SearchClubs([FromQuery] string query)
        {
            // Validate that the query parameter is provided
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Query parameter is required." });

            // Search for clubs where the name, description, or categories contain the query string
            var clubs = await _context.Clubs
                .Where(c => EF.Functions.Like(c.Name, $"%{query}%") ||
                            EF.Functions.Like(c.Description, $"%{query}%") ||
                            EF.Functions.Like(c.Categories, $"%{query}%"))
                .Include(c => c.Members)
                    .ThenInclude(m => m.User)
                .ToListAsync();

            // Map each found club to a ClubResponse DTO
            var response = clubs.Select(c => new ClubResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Categories = c.Categories,
                Members = c.Members.Select(m => new ClubMemberResponse
                {
                    UserId = m.UserId,
                    UFID = m.User.UFID,
                    Name = m.User.Name,
                    Role = m.Role.ToString()
                }).ToList()
            }).ToList();

            // Return the search results
            return Ok(response);
        }

        // POST: api/Club
        [HttpPost]
        public async Task<ActionResult<ClubResponse>> CreateClub([FromBody] CreateClubRequest request)
        {
            // Validate the incoming request model
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Extract the UFID of the authenticated user from the claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            // Retrieve the user who is creating the club
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UFID == ufid);

            // Create a new Club entity with the provided details
            var club = new Club
            {
                Name = request.Name,
                Description = request.Description,
                Categories = request.Categories
            };

            // Add the new club to the database
            _context.Clubs.Add(club);
            await _context.SaveChangesAsync();

            // Check if the user is null before creating a ClubMember entity
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Create a ClubMember entity to associate the creator as an Admin member of the club
            var membership = new ClubMember
            {
                ClubId = club.Id,
                UserId = user.Id,
                Role = MembershipRole.Admin
            };

            // Add the membership to the database
            _context.ClubMembers.Add(membership);
            await _context.SaveChangesAsync();

            // Map the created club and its initial member to a ClubResponse DTO
            var response = new ClubResponse
            {
                Id = club.Id,
                Name = club.Name,
                Description = club.Description,
                Categories = club.Categories,
                Members = new List<ClubMemberResponse>
                {
                    new ClubMemberResponse
                    {
                        UserId = user.Id,
                        UFID = user.UFID,
                        Name = user.Name,
                        Role = membership.Role.ToString()
                    }
                }
            };

            // Return a 201 Created response with the club details
            return CreatedAtAction(nameof(GetClub), new { id = club.Id }, response);
        }

        // POST: api/Club/{clubId}/join
        [HttpPost("{clubId}/join")]
        public async Task<IActionResult> JoinClub(int clubId)
        {
            // Extract the UFID of the authenticated user from the claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            // Retrieve the user attempting to join the club
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UFID == ufid);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Retrieve the club the user wants to join, including its current members
            var club = await _context.Clubs
                .Include(c => c.Members)
                .FirstOrDefaultAsync(c => c.Id == clubId);

            if (club == null)
                return NotFound(new { message = "Club not found." });

            // Check if the user is already a member of the club
            if (club.Members.Any(m => m.UserId == user.Id))
                return BadRequest(new { message = "You are already a member of this club." });

            // Create a new ClubMember entity with the role of Member
            var membership = new ClubMember
            {
                ClubId = clubId,
                UserId = user.Id,
                Role = MembershipRole.Member
            };

            // Add the membership to the database
            _context.ClubMembers.Add(membership);
            await _context.SaveChangesAsync();

            // Return a success message upon successful join
            return Ok(new { message = "Successfully joined the club." });
        }

        // GET: api/Club/{clubId}/members
        [HttpGet("{clubId}/members")]
        public async Task<IActionResult> GetClubMembers(int clubId)
        {
            // Retrieve the club along with its members and associated user details
            var club = await _context.Clubs
                .Include(c => c.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(c => c.Id == clubId);

            if (club == null)
                return NotFound(new { message = "Club not found." });

            // Extract the UFID of the authenticated user from the claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            // Retrieve the authenticated user from the database, including their club memberships
            var user = await _context.Users
                .Include(u => u.ClubMemberships)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
                return NotFound(new { message = "User not found." });

            // Check if the user is a member of the specified club
            var isMember = user.ClubMemberships.Any(cm => cm.ClubId == clubId);
            if (!isMember)
                return Forbid("You are not a member of this club.");

            // Map each club member to a ClubMemberResponse DTO
            var members = club.Members.Select(m => new ClubMemberResponse
            {
                UserId = m.UserId,
                UFID = m.User.UFID,
                Name = m.User.Name,
                Role = m.Role.ToString()
            }).ToList();

            // Return the list of club members
            return Ok(members);
        }

        // PUT: api/Club/{clubId}/promote/{userId}
        [HttpPut("{clubId}/promote/{userId}")]
        public async Task<IActionResult> PromoteMember(int clubId, int userId)
        {
            // Extract the UFID of the authenticated user from the claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            // Retrieve the authenticated user, including their club memberships
            var currentUser = await _context.Users
                .Include(u => u.ClubMemberships)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (currentUser == null)
                return NotFound(new { message = "Current user not found." });

            // Retrieve the club the member belongs to, including its current members
            var club = await _context.Clubs
                .Include(c => c.Members)
                .FirstOrDefaultAsync(c => c.Id == clubId);

            if (club == null)
                return NotFound(new { message = "Club not found." });

            // Check if the current user is an admin of the club
            var currentMembership = club.Members.FirstOrDefault(m => m.UserId == currentUser.Id);
            if (currentMembership == null || currentMembership.Role != MembershipRole.Admin)
                return Forbid("Only admins can promote members.");

            // Retrieve the member to be promoted
            var member = club.Members.FirstOrDefault(m => m.UserId == userId);
            if (member == null)
                return NotFound(new { message = "Member not found in the club." });

            // Check if the member is already an admin
            if (member.Role == MembershipRole.Admin)
                return BadRequest(new { message = "Member is already an admin." });

            // Promote the member to admin
            member.Role = MembershipRole.Admin;
            await _context.SaveChangesAsync();

            // Return a success message upon successful promotion
            return Ok(new { message = "Member promoted to admin successfully." });
        }

        // Helper method to check if a club exists by ID
        private bool ClubExists(int id)
        {
            return _context.Clubs.Any(e => e.Id == id);
        }
    }
}
