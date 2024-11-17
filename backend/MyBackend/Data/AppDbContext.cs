// Data/AppDbContext.cs
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

        // DbSets for all entities
        public DbSet<User> Users { get; set; }
        public DbSet<Club> Clubs { get; set; }
        public DbSet<ClubMember> ClubMembers { get; set; }
        public DbSet<InterestCategory> InterestCategories { get; set; }
        public DbSet<Event> Events { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique index on User.UFID
            modelBuilder.Entity<User>()
                .HasIndex(u => u.UFID)
                .IsUnique();

            // Configure User - ClubMember relationship
            modelBuilder.Entity<ClubMember>()
                .HasOne(cm => cm.User)
                .WithMany(u => u.ClubMemberships)
                .HasForeignKey(cm => cm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Club - ClubMember relationship
            modelBuilder.Entity<ClubMember>()
                .HasOne(cm => cm.Club)
                .WithMany(c => c.Members)
                .HasForeignKey(cm => cm.ClubId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure User - InterestCategory relationship
            modelBuilder.Entity<InterestCategory>()
                .HasOne(ic => ic.User)
                .WithMany(u => u.InterestCategories)
                .HasForeignKey(ic => ic.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Club - Event relationship
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Club)
                .WithMany(c => c.Events)
                .HasForeignKey(e => e.ClubId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
