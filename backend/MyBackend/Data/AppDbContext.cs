using Microsoft.EntityFrameworkCore;
using ClubSwamp.Models;

namespace ClubSwamp.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Club> Clubs { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
    }
}