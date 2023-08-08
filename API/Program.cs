using API.Data;
using API.Data.Seeds;
using API.Entities;
using API.Extensions;
using API.Middleware;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole",
        policy => policy.RequireRole("Admin"));
});

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().WithOrigins("https://localhost:4200"));

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


// apple seeding of users 
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    var roleManager = services.GetRequiredService<RoleManager<AppRole>>();

    await context.Database.MigrateAsync();
    await UserSeed.Seed(userManager, roleManager);
}
catch (System.Exception ex)
{
    var _logger = services.GetService<ILogger<Program>>();
    _logger.LogError(ex, "Error while update migrations");
}

app.Run();