using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ClubSwamp.Models.DTOs;
using ClubSwamp.Services;

namespace ClubSwamp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly Authenticator _authenticator;

        public AccountController(Authenticator authenticator)
        {
            _authenticator = authenticator;
        }

        [HttpPost("register")]
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
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var token = await _authenticator.AuthenticateAsync(request.UFID, request.Password);
            if (token == null)
                return Unauthorized("Invalid username or password.");

            return Ok(new { Token = token });
        }
    }
}