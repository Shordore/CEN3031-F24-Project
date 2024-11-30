// Controllers/RecommendationController.cs

using ClubSwamp.Services;
using ClubSwamp.Models.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using ClubSwamp.Data;
using Microsoft.EntityFrameworkCore;

namespace ClubSwamp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecommendationController : ControllerBase
    {
        private readonly RecommendationService _recommendationService;
        private readonly AppDbContext _context;

        // Constructor injecting RecommendationService and AppDbContext for dependency management
        public RecommendationController(RecommendationService recommendationService, AppDbContext context)
        {
            _recommendationService = recommendationService;
            _context = context;
        }

        // GET: api/Recommendation
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClubResponse>>> GetRecommendations()
        {
            // Retrieve the UFID of the authenticated user from JWT claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
            {
                // Return 401 Unauthorized if UFID is not found in claims
                return Unauthorized(new { message = "User not authenticated." });
            }

            // Find the user in the database using the retrieved UFID
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
            {
                // Return 404 Not Found if the user does not exist in the database
                return NotFound(new { message = "User not found." });
            }

            // Get recommended clubs for the user using the RecommendationService
            var recommendedClubs = await _recommendationService.GetRecommendationsForUserAsync(user.Id);

            if (!recommendedClubs.Any())
            {
                // Return 404 Not Found if no recommendations are available for the user
                return NotFound(new { message = "No recommendations found for this user." });
            }

            // Map the recommended clubs to ClubResponse DTOs for the API response
            var response = recommendedClubs.Select(c => new ClubResponse
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

            // Return the list of recommended clubs with a 200 OK status
            return Ok(response);
        }
    }
}
