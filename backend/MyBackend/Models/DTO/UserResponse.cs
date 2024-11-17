namespace ClubSwamp.Models.DTO
{
    public class UserResponse
    {
        public int Id { get; set; }
        public string UFID { get; set; }
        public string Name { get; set; }
        public string Grade { get; set; }
        public string Major { get; set; }
        public List<ClubMembershipResponse> ClubMemberships { get; set; }
        public List<string> InterestCategories { get; set; }
    }

    public class ClubMembershipResponse
    {
        public int ClubId { get; set; }
        public string ClubName { get; set; }
        public string Role { get; set; }
    }
}
