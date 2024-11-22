using ClubSwamp.Data;
using ClubSwamp.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ClubSwamp.Services
{
    public class RecommendationService
    {
        private readonly AppDbContext _context;

        public RecommendationService(AppDbContext context)
        {
            _context = context;
        }

        // Method to get club recommendations for a user
        public async Task<List<Club>> GetRecommendationsForUserAsync(int userId)
        {
            // Step 1: Fetch user's interests from InterestCategory table
            var userInterests = await _context.InterestCategories
                                              .Where(ic => ic.UserId == userId)
                                              .Select(ic => ic.Category)
                                              .ToListAsync();

            if (userInterests == null || !userInterests.Any())
            {
                return new List<Club>(); // Return an empty list if no interests found
            }

            // Step 2: Fetch clubs that match user interests
            var recommendedClubs = await _context.Clubs
                                                 .Where(c => userInterests.Contains(c.Categories)) // Assuming Categories field is a string with a single interest
                                                 .Include(c => c.Members)
                                                     .ThenInclude(m => m.User)
                                                 .ToListAsync();

            return recommendedClubs;
        }
    }
}
