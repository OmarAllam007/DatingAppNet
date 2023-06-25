using API.Helpers;
using API.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace API.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly Cloudinary _cloudinary;
        public PhotoService(IOptions<CloudinarySettings> config)
        {
            var account = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(account);
        }
        public async Task<DeletionResult> DeletePhotoAsync(string publicId)
        {
            var deleteParams = new DeletionParams(publicId);
            return await _cloudinary.DestroyAsync(deleteParams);
        }

        public async Task<ImageUploadResult> UploadPhotoAsync(IFormFile file)
        {
            var result = new ImageUploadResult();

            if (file.Length > 0)
            {
                using var fileStream = file.OpenReadStream();

                var imageParams = new ImageUploadParams{
                    File = new FileDescription(file.FileName,fileStream),
                    Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face"),
                    Folder = "da-net7",
                };

                result = await _cloudinary.UploadAsync(imageParams);
            }

            return result;
        }
    }
}