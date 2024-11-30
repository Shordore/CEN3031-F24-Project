using System.ComponentModel.DataAnnotations;

namespace ClubSwamp.Models.DTO
{

    public class RegisterRequest

    {

        public string UFID { get; set; }

        public string Password { get; set; }

        public string Name { get; set; }

        public string Grade { get; set; }

        public string Major { get; set; }
    }
}