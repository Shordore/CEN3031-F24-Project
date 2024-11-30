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

        // Constructor injecting the AppDbContext for database operations
        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventResponse>>> GetEvents()
        {
            // Retrieve the UFID of the authenticated user from the claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            // Fetch the user along with their club memberships
            var user = await _context.Users
                .Include(u => u.ClubMemberships)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
                return NotFound(new { message = "User not found." });

            // Extract the list of club IDs the user is a member of
            var clubIds = user.ClubMemberships.Select(cm => cm.ClubId).ToList();

            // Retrieve events associated with the user's clubs, including club details
            var events = await _context.Events
                .Where(e => clubIds.Contains(e.ClubId))
                .Include(e => e.Club)
                .ToListAsync();

            // Map the event entities to EventResponse DTOs
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

            // Return the list of events
            return Ok(response);
        }

        // GET: api/Events/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EventResponse>> GetEvent(int id)
        {
            // Retrieve the event with the specified ID, including its associated club
            var evt = await _context.Events
                .Include(e => e.Club)
                .FirstOrDefaultAsync(e => e.Id == id);

            // If the event does not exist, return a 404 Not Found response
            if (evt == null)
                return NotFound(new { message = "Event not found." });

            // Retrieve the UFID of the authenticated user from the claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            // Fetch the user along with their club memberships
            var user = await _context.Users
                .Include(u => u.ClubMemberships)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
                return NotFound(new { message = "User not found." });

            // Check if the user is a member of the club associated with the event
            var isMemberOrAdmin = user.ClubMemberships.Any(cm => cm.ClubId == evt.ClubId);
            if (!isMemberOrAdmin)
                return Forbid(); // User is not authorized to view the event

            // Map the event entity to an EventResponse DTO
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

            // Return the event details
            return Ok(response);
        }

        // GET: api/Events/search?query=...
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<EventResponse>>> SearchEvents([FromQuery] string query)
        {
            // Validate that the query parameter is provided
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Query parameter is required." });

            // Retrieve the UFID of the authenticated user from the claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            // Fetch the user along with their club memberships
            var user = await _context.Users
                .Include(u => u.ClubMemberships)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
                return NotFound(new { message = "User not found." });

            // Extract the list of club IDs the user is a member of
            var clubIds = user.ClubMemberships.Select(cm => cm.ClubId).ToList();

            // Search for events within the user's clubs that match the query in title, description, or location
            var events = await _context.Events
                .Where(e => clubIds.Contains(e.ClubId) &&
                            (EF.Functions.Like(e.Title, $"%{query}%") ||
                             EF.Functions.Like(e.Description, $"%{query}%") ||
                             EF.Functions.Like(e.Location, $"%{query}%")))
                .Include(e => e.Club)
                .ToListAsync();

            // Map the event entities to EventResponse DTOs
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

            // Return the search results
            return Ok(response);
        }

        // POST: api/Events
        [HttpPost]
        public async Task<ActionResult<EventResponse>> CreateEvent([FromBody] CreateEventRequest request)
        {
            // Validate the incoming request model
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Retrieve the UFID of the authenticated user from the claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            // Fetch the user attempting to create an event
            var user = await _context.Users
                .Include(u => u.ClubMemberships)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
                return NotFound(new { message = "User not found." });

            // Check if the user is a member of the specified club
            var clubMembership = user.ClubMemberships.FirstOrDefault(cm => cm.ClubId == request.ClubId);
            if (clubMembership == null)
                return BadRequest(new { message = "You are not a member of the specified club." });

            // Ensure that only admins can create events
            if (clubMembership.Role != MembershipRole.Admin)
                return Forbid();

            // Retrieve the club to which the event will be added
            var club = await _context.Clubs.FirstOrDefaultAsync(c => c.Id == request.ClubId);
            if (club == null)
                return NotFound(new { message = "Club not found." });

            // Create a new Event entity with the provided details
            var newEvent = new Event
            {
                ClubId = request.ClubId,
                Title = request.Title,
                Description = request.Description,
                Location = request.Location,
                DateTime = request.DateTime
            };

            // Add the new event to the database
            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            // Map the created event and its associated club to an EventResponse DTO
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

            // Return a 201 Created response with the event details
            return CreatedAtAction(nameof(GetEvent), new { id = newEvent.Id }, response);
        }

        // POST: api/Events/{clubId}/join
        [HttpPost("{clubId}/join")]
        public async Task<IActionResult> JoinClub(int clubId)
        {
            // Retrieve the UFID of the authenticated user from the claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            // Fetch the user attempting to join the club
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

        // GET: api/Events/{clubId}/members
        [HttpGet("{clubId}/members")]
        public async Task<IActionResult> GetClubMembers(int clubId)
        {
            // Retrieve the club along with its members and associated user details
            var club = await _context.Clubs
                .Include(c => c.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(c => c.Id == clubId);

            // If the club does not exist, return a 404 Not Found response
            if (club == null)
                return NotFound(new { message = "Club not found." });

            // Retrieve the UFID of the authenticated user from the claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            // Fetch the authenticated user along with their club memberships
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

        // PUT: api/Events/{clubId}/promote/{userId}
        [HttpPut("{clubId}/promote/{userId}")]
        public async Task<IActionResult> PromoteMember(int clubId, int userId)
        {
            // Retrieve the UFID of the authenticated user from the claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized(new { message = "User not authenticated." });

            // Fetch the authenticated user along with their club memberships
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
