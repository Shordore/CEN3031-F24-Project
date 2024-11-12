using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClubSwamp.Data;
using ClubSwamp.Models;
using ClubSwamp.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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

        // GET: api/club
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

            return response;
        }

        // GET: api/club/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ClubResponse>> GetClub(int id)
        {
            var club = await _context.Clubs
                .Include(c => c.Members)
                    .ThenInclude(cm => cm.User)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (club == null)
                return NotFound();

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

            return response;
        }

        // POST: api/club
        [HttpPost]
        public async Task<ActionResult<ClubResponse>> CreateClub([FromBody] CreateClubRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UFID == ufid);
            if (user == null)
                return NotFound("User not found.");

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


        // PUT: api/club/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClub(int id, [FromBody] Club club)
        {
            if (id != club.Id)
                return BadRequest();

            _context.Entry(club).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClubExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/club/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClub(int id)
        {
            var club = await _context.Clubs.FindAsync(id);
            if (club == null)
                return NotFound();

            _context.Clubs.Remove(club);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ClubExists(int id)
        {
            return _context.Clubs.Any(e => e.Id == id);
        }

        [HttpPost("{clubId}/join")]
        public async Task<IActionResult> JoinClub(int clubId)
        {
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UFID == ufid);
            if (user == null)
                return NotFound("User not found.");

            var club = await _context.Clubs.Include(c => c.Members).FirstOrDefaultAsync(c => c.Id == clubId);
            if (club == null)
                return NotFound("Club not found.");

            // Check if user is already a member
            if (club.Members.Any(m => m.UserId == user.Id))
                return BadRequest("User is already a member of this club.");

            var membership = new ClubMember
            {
                ClubId = clubId,
                UserId = user.Id,
                Role = MembershipRole.Member
            };

            _context.ClubMembers.Add(membership);
            await _context.SaveChangesAsync();

            return Ok("Joined the club successfully.");
        }

        // GET: api/club/{clubId}/members
        [HttpGet("{clubId}/members")]
        public async Task<IActionResult> GetClubMembers(int clubId)
        {
            var club = await _context.Clubs
                .Include(c => c.Members)
                .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(c => c.Id == clubId);

            if (club == null)
                return NotFound("Club not found.");

            var members = club.Members.Select(m => new ClubMemberResponse
            {
                UserId = m.UserId,
                UFID = m.User.UFID,
                Name = m.User.Name,
                Role = m.Role.ToString()
            }).ToList();

            return Ok(members);
        }

        // PUT: api/club/{clubId}/promote/{userId}
        [HttpPut("{clubId}/promote/{userId}")]
        public async Task<IActionResult> PromoteMember(int clubId, int userId)
        {
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized();

            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.UFID == ufid);
            if (currentUser == null)
                return NotFound("Current user not found.");

            var club = await _context.Clubs
                .Include(c => c.Members)
                .FirstOrDefaultAsync(c => c.Id == clubId);
            if (club == null)
                return NotFound("Club not found.");

            var currentMembership = club.Members.FirstOrDefault(m => m.UserId == currentUser.Id);
            if (currentMembership == null || currentMembership.Role != MembershipRole.Admin)
                return Forbid("Only admins can promote members.");

            var member = club.Members.FirstOrDefault(m => m.UserId == userId);
            if (member == null)
                return NotFound("Member not found in the club.");

            if (member.Role == MembershipRole.Admin)
                return BadRequest("Member is already an admin.");

            member.Role = MembershipRole.Admin;
            await _context.SaveChangesAsync();

            return Ok("Member promoted to admin successfully.");
        }
    }
}