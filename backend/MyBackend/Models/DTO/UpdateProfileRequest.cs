using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClubSwamp.Models.DTO
{
    public class UpdateProfileRequest
    {
        [Required]
        public string Name { get; set; }

        public string Grade { get; set; }
        public string Major { get; set; }

        public List<string> InterestCategories { get; set; }
    }
}
