// Models/Club.cs
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClubSwamp.Models
{
    public class Club
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public string Description { get; set; }
        public string Categories { get; set; }

        public ICollection<ClubMember> Members { get; set; } = new List<ClubMember>();

        // New Navigation Property for Events
        public ICollection<Event> Events { get; set; } = new List<Event>();
    }
}
