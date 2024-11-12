// Controllers/AccountController.cs
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ClubSwamp.Data;
using ClubSwamp.Models;
using ClubSwamp.Models.DTOs;
using ClubSwamp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClubSwamp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly Authenticator _authenticator;
        private readonly AppDbContext _context;

        public AccountController(Authenticator authenticator, AppDbContext context)
        {
            _authenticator = authenticator;
            _context = context;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authenticator.RegisterAsync(request.UFID, request.Password);
            if (!result)
                return BadRequest("Username already exists.");

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var token = await _authenticator.AuthenticateAsync(request.UFID, request.Password);
            if (token == null)
                return Unauthorized("Invalid username or password.");

            return Ok(new { Token = token });
        }

        [HttpGet("me")]
        public async Task<ActionResult<UserResponse>> GetCurrentUser()
        {
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized();

            var user = await _context.Users
                .Include(u => u.ClubMemberships)
                    .ThenInclude(cm => cm.Club)
                .Include(u => u.InterestCategories)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
                return NotFound("User not found.");

            var response = new UserResponse
            {
                Id = user.Id,
                UFID = user.UFID,
                Name = user.Name,
                Grade = user.Grade,
                Major = user.Major,
                ClubMemberships = user.ClubMemberships.Select(cm => new ClubMembershipResponse
                {
                    ClubId = cm.ClubId,
                    ClubName = cm.Club.Name,
                    Role = cm.Role.ToString()
                }).ToList(),
                InterestCategories = user.InterestCategories.Select(ic => ic.Category).ToList()
            };

            return response;
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
                return Unauthorized();

            var user = await _context.Users
                .Include(u => u.InterestCategories)
                .FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
                return NotFound("User not found.");

            user.Name = request.Name;
            user.Grade = request.Grade;
            user.Major = request.Major;

            _context.InterestCategories.RemoveRange(user.InterestCategories);

            if (request.InterestCategories != null)
            {
                foreach (var category in request.InterestCategories)
                {
                    user.InterestCategories.Add(new InterestCategory
                    {
                        Category = category,
                        UserId = user.Id
                    });
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
