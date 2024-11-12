using System.ComponentModel.DataAnnotations;

namespace ClubSwamp.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string UFID { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public string Name { get; set; }
        public string Grade { get; set; }
        public string Major { get; set; }

        public ICollection<InterestCategory> InterestCategories { get; set; } = new List<InterestCategory>();

        public ICollection<ClubMember> ClubMemberships { get; set; } = new List<ClubMember>();
    }

    public class InterestCategory
    {
        public int Id { get; set; }

        [Required]
        public string Category { get; set; }

        public int UserId { get; set; }

        public User User { get; set; }
    }
}
