using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ClubSwamp.Models; // Assuming you have models for Club and Event

namespace ClubSwamp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClubSwampController : ControllerBase
    {
        private readonly ILogger<ClubSwampController> _logger;

        // Sample in-memory data storage for clubs (replace with a database in production)
        private static List<Club> clubs = new List<Club>
        // this is just an example
        {
            new Club { Id = 1, Name = "Tech Club", Description = "A club for tech enthusiasts", OrganizerContact = "tech@club.com" },
            new Club { Id = 2, Name = "Art Club", Description = "Explore art and creativity", OrganizerContact = "art@club.com" }
        };

        public ClubSwampController(ILogger<ClubSwampController> logger)
        {
            _logger = logger;
        }

        // GET api/clubswamp
        [HttpGet]
        public IEnumerable<Club> GetAllClubs()
        {
            _logger.LogInformation("Fetching all clubs");
            return clubs;
        }

        // GET api/clubswamp/{id}
        [HttpGet("{id}")]
        public ActionResult<Club> GetClubById(int id)
        {
            _logger.LogInformation($"Fetching details for club with ID {id}");
            var club = clubs.FirstOrDefault(c => c.Id == id);
            if (club == null)
            {
                _logger.LogWarning($"Club with ID {id} not found");
                return NotFound("Club not found");
            }

            return Ok(club);
        }

        // POST api/clubswamp
        [HttpPost]
        public ActionResult AddClub([FromBody] Club newClub)
        {
            if (newClub == null)
            {
                _logger.LogWarning("Attempted to add a null club");
                return BadRequest("Invalid club data");
            }

            // Assign an ID (this would be handled by a database in a real application)
            newClub.Id = clubs.Count + 1;
            clubs.Add(newClub);
            _logger.LogInformation($"Club {newClub.Name} added with ID {newClub.Id}");

            return CreatedAtAction(nameof(GetClubById), new { id = newClub.Id }, newClub);
        }

        // PUT api/clubswamp/{id}
        [HttpPut("{id}")]
        public ActionResult UpdateClub(int id, [FromBody] Club updatedClub)
        {
            _logger.LogInformation($"Updating club with ID {id}");
            var club = clubs.FirstOrDefault(c => c.Id == id);
            if (club == null)
            {
                _logger.LogWarning($"Club with ID {id} not found for update");
                return NotFound("Club not found");
            }

            // Update club details
            club.Name = updatedClub.Name;
            club.Description = updatedClub.Description;
            club.OrganizerContact = updatedClub.OrganizerContact;

            _logger.LogInformation($"Club {club.Name} updated successfully");
            return NoContent();
        }

        // DELETE api/clubswamp/{id}
        [HttpDelete("{id}")]
        public ActionResult DeleteClub(int id)
        {
            _logger.LogInformation($"Deleting club with ID {id}");
            var club = clubs.FirstOrDefault(c => c.Id == id);
            if (club == null)
            {
                _logger.LogWarning($"Club with ID {id} not found for deletion");
                return NotFound("Club not found");
            }

            clubs.Remove(club);
            _logger.LogInformation($"Club {club.Name} deleted successfully");
            return NoContent();
        }
    }
}
