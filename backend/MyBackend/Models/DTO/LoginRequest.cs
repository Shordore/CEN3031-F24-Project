using System.ComponentModel.DataAnnotations;

namespace ClubSwamp.Models.DTOs
{
    public class LoginRequest
    {
        [Required]
        public string UFID { get; set; }

        [Required]
        public string Password { get; set; }
    }
}