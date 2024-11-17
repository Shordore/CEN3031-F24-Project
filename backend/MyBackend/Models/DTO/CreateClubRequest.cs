using System.ComponentModel.DataAnnotations;

namespace ClubSwamp.Models.DTO
{
    public class CreateClubRequest
    {
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }
        public string Categories { get; set; }
    }
}
