using API.Data;
using API.Helpers;
using API.Interfaces;
using API.Services;
using API.SingalR;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services,
        IConfiguration config)
        {
            services.AddDbContext<DataContext>(optionsAction =>
            {
                optionsAction.UseSqlite(config.GetConnectionString("DefaultConnection"));
            });

            services.AddScoped<ITokenService, TokenService>();
            
            services.AddAutoMapper(typeof(Program));
            services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));
            services.AddScoped<IPhotoService,PhotoService>();
            services.AddScoped<LogUserActivity>();
            services.AddScoped<IUnitOfWork,UnitOfWork>();
            services.AddSignalR();

            services.AddSingleton<PresenceTracker>();
            
            services.AddCors();
            
            return services;

        }
    }
}