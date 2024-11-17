namespace ClubSwamp.Models.DTO
{
    public class EventResponse
    {
        public int Id { get; set; }
        public int ClubId { get; set; }
        public string ClubName { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime DateTime { get; set; }
    }
}
