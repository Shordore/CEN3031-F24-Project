using System.ComponentModel.DataAnnotations;

namespace ClubSwamp.Models.DTOs
{
    public class CreateClubRequest
    {
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }
        public string Categories { get; set; }
    }
}
