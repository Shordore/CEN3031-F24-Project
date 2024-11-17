namespace ClubSwamp.Models.DTO
{
    public class ClubResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Categories { get; set; }
        public List<ClubMemberResponse> Members { get; set; }
    }

    public class ClubMemberResponse
    {
        public int UserId { get; set; }
        public string UFID { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
    }
}
