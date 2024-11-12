using ClubSwamp.Models;
using Microsoft.EntityFrameworkCore;

namespace ClubSwamp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Club> Clubs { get; set; }
        public DbSet<ClubMember> ClubMembers { get; set; }
        public DbSet<InterestCategory> InterestCategories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => u.UFID)
                .IsUnique();

            modelBuilder.Entity<ClubMember>()
                .HasOne(cm => cm.User)
                .WithMany(u => u.ClubMemberships)
                .HasForeignKey(cm => cm.UserId);

            modelBuilder.Entity<ClubMember>()
                .HasOne(cm => cm.Club)
                .WithMany(c => c.Members)
                .HasForeignKey(cm => cm.ClubId);

            modelBuilder.Entity<InterestCategory>()
                .HasOne(ic => ic.User)
                .WithMany(u => u.InterestCategories)
                .HasForeignKey(ic => ic.UserId);
        }
    }
}
