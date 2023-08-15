using System.Text.RegularExpressions;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
    // : IdentityDbContext<TUser,TRole,TKey,IdentityUserClaim<TKey>,IdentityUserRole<TKey>,IdentityUserLogin<TKey>,IdentityRoleClaim<TKey>,IdentityUserToken<TKey>>
namespace API.Data
{
    public class DataContext : IdentityDbContext<AppUser,AppRole,int,
        IdentityUserClaim<int>,AppUserRole,IdentityUserLogin<int>,IdentityRoleClaim<int>,IdentityUserToken<int>>
    {
        public DataContext(DbContextOptions options) : base(options)
        {
            
        }

        public DbSet<AppUser> Users { get; set; }
        public DbSet<UserLike> Likes { get; set; }
        public DbSet<Message> Messages { get; set; }

        public DbSet<ConnectionGroup> ConnectionGroups { get; set; }
        public DbSet<Connection> Connections { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AppUser>()
                .HasMany(ur => ur.AppUserRoles)
                .WithOne(ur => ur.AppUser)
                .HasForeignKey(ur => ur.UserId)
                .IsRequired();
            
            
            modelBuilder.Entity<AppRole>()
                .HasMany(ro => ro.AppUserRoles)
                .WithOne(ro => ro.AppRole)
                .HasForeignKey(ro => ro.RoleId)
                .IsRequired();
            
            modelBuilder.Entity<UserLike>()
            .HasKey(l => new { l.SourceUserId, l.TargetUserId });

            
            

            modelBuilder.Entity<UserLike>()
            .HasOne(l => l.SourceUser)
            .WithMany(l => l.LikedUsers)
            .HasForeignKey(l => l.SourceUserId)
            .OnDelete(DeleteBehavior.Cascade);
            
            
            modelBuilder.Entity<UserLike>()
            .HasOne(l => l.TargetUser)
            .WithMany(l => l.LikedByUsers)
            .HasForeignKey(l => l.TargetUserId)
            .OnDelete(DeleteBehavior.Cascade);// if sqlserver it will be changed to No Action


            modelBuilder.Entity<Message>()
                .HasOne(u => u.Recipient)
                .WithMany(m => m.MessagesReceived)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Message>()
                .HasOne(u => u.Sender)
                .WithMany(m => m.MessagesSent)
                .OnDelete(DeleteBehavior.Restrict);
            
            

        }
    }
}