using System.ComponentModel.DataAnnotations;

namespace ClubSwamp.Models.DTO
{
    public class CreateEventRequest
    {
        [Required]
        public int ClubId { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        public string Location { get; set; }

        [Required]
        public DateTime DateTime { get; set; }
    }
}
