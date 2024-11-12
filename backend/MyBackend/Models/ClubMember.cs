namespace ClubSwamp.Models
{
    public enum MembershipRole
    {
        Member,
        Admin
    }

    public class ClubMember
    {
        public int Id { get; set; }

        // Foreign Keys
        public int ClubId { get; set; }
        public int UserId { get; set; }

        // Role in the Club
        public MembershipRole Role { get; set; }

        // Navigation Properties
        public Club Club { get; set; }
        public User User { get; set; }
    }
}
