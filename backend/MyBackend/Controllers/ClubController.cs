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

        public ClubController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClubResponse>>> GetClubs()
        {
            var clubs = await _context.Clubs
                .Include(c => c.Members)
                    .ThenInclude(cm => cm.User)
                .ToListAsync();

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

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClubResponse>> GetClub(int id)
        {
            var club = await _context.Clubs
                .Include(c => c.Members)
                    .ThenInclude(cm => cm.User)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (club == null)
                return NotFound(new { message = "Club not found." });

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

            return Ok(response);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ClubResponse>>> SearchClubs([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Query parameter is required." });

            var clubs = await _context.Clubs
                .Where(c => EF.Functions.Like(c.Name, $"%{query}%") ||
                            EF.Functions.Like(c.Description, $"%{query}%") ||
                            EF.Functions.Like(c.Categories, $"%{query}%"))
                .Include(c => c.Members)
                    .ThenInclude(m => m.User)
                .ToListAsync();

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

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<ClubResponse>> CreateClub([FromBody] CreateClubRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UFID == ufid);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var club = new Club
            {
                Name = request.Name,
                Description = request.Description,
                Categories = request.Categories
            };

            _context.Clubs.Add(club);
            await _context.SaveChangesAsync();

            var membership = new ClubMember
            {
                ClubId = club.Id,
                UserId = user.Id,
                Role = MembershipRole.Admin
            };

            _context.ClubMembers.Add(membership);
            await _context.SaveChangesAsync();

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

            return CreatedAtAction(nameof(GetClub), new { id = club.Id }, response);
        }

        [HttpPost("{clubId}/join")]
        public async Task<IActionResult> JoinClub(int clubId)
        {
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UFID == ufid);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var club = await _context.Clubs
                .Include(c => c.Members)
                .FirstOrDefaultAsync(c => c.Id == clubId);

            if (club == null)
                return NotFound(new { message = "Club not found." });

            if (club.Members.Any(m => m.UserId == user.Id))
                return BadRequest(new { message = "You are already a member of this club." });

            var membership = new ClubMember
            {
                ClubId = clubId,
                UserId = user.Id,
                Role = MembershipRole.Member
            };

            _context.ClubMembers.Add(membership);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Successfully joined the club." });
        }

        [HttpGet("{clubId}/members")]
        public async Task<IActionResult> GetClubMembers(int clubId)
        {
            var club = await _context.Clubs
                .Include(c => c.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(c => c.Id == clubId);

            if (club == null)
                return NotFound(new { message = "Club not found." });

            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            var user = await _context.Users
                .Include(u => u.ClubMemberships)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
                return NotFound(new { message = "User not found." });

            var isMember = user.ClubMemberships.Any(cm => cm.ClubId == clubId);
            if (!isMember)
                return Forbid("You are not a member of this club.");

            var members = club.Members.Select(m => new ClubMemberResponse
            {
                UserId = m.UserId,
                UFID = m.User.UFID,
                Name = m.User.Name,
                Role = m.Role.ToString()
            }).ToList();

            return Ok(members);
        }

       
        [HttpPut("{clubId}/promote/{userId}")]
        public async Task<IActionResult> PromoteMember(int clubId, int userId)
        {
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            var currentUser = await _context.Users
                .Include(u => u.ClubMemberships)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (currentUser == null)
                return NotFound(new { message = "Current user not found." });

            var club = await _context.Clubs
                .Include(c => c.Members)
                .FirstOrDefaultAsync(c => c.Id == clubId);

            if (club == null)
                return NotFound(new { message = "Club not found." });

            var currentMembership = club.Members.FirstOrDefault(m => m.UserId == currentUser.Id);
            if (currentMembership == null || currentMembership.Role != MembershipRole.Admin)
                return Forbid("Only admins can promote members.");

            var member = club.Members.FirstOrDefault(m => m.UserId == userId);
            if (member == null)
                return NotFound(new { message = "Member not found in the club." });

            if (member.Role == MembershipRole.Admin)
                return BadRequest(new { message = "Member is already an admin." });

            member.Role = MembershipRole.Admin;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Member promoted to admin successfully." });
        }

        private bool ClubExists(int id)
        {
            return _context.Clubs.Any(e => e.Id == id);
        }
    }
}
