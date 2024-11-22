using ClubSwamp.Services;
using ClubSwamp.Models.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

namespace ClubSwamp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Ensures that the user is authenticated
    public class RecommendationController : ControllerBase
    {
        private readonly RecommendationService _recommendationService;
        private readonly AppDbContext _context;

        public RecommendationController(RecommendationService recommendationService, AppDbContext context)
        {
            _recommendationService = recommendationService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClubResponse>>> GetRecommendations()
        {
            // Step 1: Get the logged-in user's UFID from JWT claims
            var ufid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (ufid == null)
            {
                return Unauthorized(new { message = "User not authenticated." });
            }

            // Step 2: Find the User ID in the database using UFID
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UFID == ufid);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Step 3: Get recommendations for the user
            var recommendedClubs = await _recommendationService.GetRecommendationsForUserAsync(user.Id);

            if (!recommendedClubs.Any())
            {
                return NotFound(new { message = "No recommendations found for this user." });
            }

            // Step 4: Map to ClubResponse DTO for response
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

            return Ok(response);
        }
    }
}
