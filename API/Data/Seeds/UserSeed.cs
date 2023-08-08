using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data.Seeds
{
    public class UserSeed
    {
        public static async Task Seed(UserManager<AppUser> userManager,RoleManager<AppRole> roleManager)
        {
            if (await userManager.Users.AnyAsync()) return;

            var userData = await File.ReadAllTextAsync("Data/UsersDataSeed.json");
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            var users = JsonSerializer.Deserialize<List<AppUser>>(userData, options);

            var roles = new List<AppRole>
            {
                new AppRole { Name = "Member" },
                new AppRole { Name = "Admin" },
                new AppRole { Name = "Moderator" },
            };
            foreach (var role in roles)
            {
                await roleManager.CreateAsync(role);
            }
            
            foreach (var user in users)
            {
                await userManager.CreateAsync(user, "Pa$$w0rd");
                await userManager.AddToRoleAsync(user, "Member");
            }

            var adminUser = new AppUser
            {
                UserName = "admin"
            };

            await userManager.CreateAsync(adminUser, "Pa$$w0rd");
            await userManager.AddToRolesAsync(adminUser, new[] { "Admin" ,"Moderator"});

        }
    }
}