using System.ComponentModel.DataAnnotations;

namespace ClubSwamp.Models
{
    public class Event
    {
        public int Id { get; set; }

        [Required]
        public int ClubId { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        public string Location { get; set; }

        [Required]
        public DateTime DateTime { get; set; }

        public Club Club { get; set; }
    }
}
