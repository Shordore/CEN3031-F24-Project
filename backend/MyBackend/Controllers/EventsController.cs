// Controllers/EventsController.cs
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
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventResponse>>> GetEvents()
        {
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            var user = await _context.Users
                .Include(u => u.ClubMemberships)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
                return NotFound(new { message = "User not found." });

            var clubIds = user.ClubMemberships.Select(cm => cm.ClubId).ToList();

            var events = await _context.Events
                .Where(e => clubIds.Contains(e.ClubId))
                .Include(e => e.Club)
                .ToListAsync();

            var response = events.Select(e => new EventResponse
            {
                Id = e.Id,
                ClubId = e.ClubId,
                ClubName = e.Club.Name,
                Title = e.Title,
                Description = e.Description,
                Location = e.Location,
                DateTime = e.DateTime
            }).ToList();

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EventResponse>> GetEvent(int id)
        {
            var evt = await _context.Events
                .Include(e => e.Club)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (evt == null)
                return NotFound(new { message = "Event not found." });

            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            var user = await _context.Users
                .Include(u => u.ClubMemberships)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
                return NotFound(new { message = "User not found." });

            var isMemberOrAdmin = user.ClubMemberships.Any(cm => cm.ClubId == evt.ClubId);
            if (!isMemberOrAdmin)
                return Forbid();

            var response = new EventResponse
            {
                Id = evt.Id,
                ClubId = evt.ClubId,
                ClubName = evt.Club.Name,
                Title = evt.Title,
                Description = evt.Description,
                Location = evt.Location,
                DateTime = evt.DateTime
            };

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<EventResponse>> CreateEvent([FromBody] CreateEventRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            var user = await _context.Users
                .Include(u => u.ClubMemberships)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
                return NotFound(new { message = "User not found." });

            var clubMembership = user.ClubMemberships.FirstOrDefault(cm => cm.ClubId == request.ClubId);
            if (clubMembership == null)
                return BadRequest(new { message = "You are not a member of the specified club." });

            if (clubMembership.Role != MembershipRole.Admin)
                return Forbid();

            var club = await _context.Clubs.FirstOrDefaultAsync(c => c.Id == request.ClubId);
            if (club == null)
                return NotFound(new { message = "Club not found." });

            var newEvent = new Event
            {
                ClubId = request.ClubId,
                Title = request.Title,
                Description = request.Description,
                Location = request.Location,
                DateTime = request.DateTime
            };

            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            var response = new EventResponse
            {
                Id = newEvent.Id,
                ClubId = club.Id,
                ClubName = club.Name,
                Title = newEvent.Title,
                Description = newEvent.Description,
                Location = newEvent.Location,
                DateTime = newEvent.DateTime
            };

            return CreatedAtAction(nameof(GetEvent), new { id = newEvent.Id }, response);
        }
    }
}
