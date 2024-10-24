using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClubSwamp.Data;
using ClubSwamp.Models;
using Microsoft.AspNetCore.Authorization;

namespace ClubSwamp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClubController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClubController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/club
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Club>>> GetClubs()
        {
            return await _context.Clubs.ToListAsync();
        }

        // GET: api/club/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Club>> GetClub(int id)
        {
            var club = await _context.Clubs.FindAsync(id);

            if (club == null)
                return NotFound();

            return club;
        }

        // POST: api/club
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Club>> CreateClub([FromBody] Club club)
        {
            _context.Clubs.Add(club);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetClub), new { id = club.Id }, club);
        }

        // PUT: api/club/{id}
        [HttpPut("{id}")]
        [Authorize]
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
        [Authorize]
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
    }
}