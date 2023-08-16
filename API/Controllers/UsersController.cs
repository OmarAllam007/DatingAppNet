using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _uow;
        private readonly IPhotoService _photoService;

        public UsersController(IUnitOfWork uow, IMapper mapper, IPhotoService photoService)
        {
            _uow = uow;
            _photoService = photoService;
            _mapper = mapper;
        }


        [HttpGet]
        public async Task<ActionResult<PagedList<MemberDto>>> GetUsers([FromQuery] UserParams userParams)
        {
            var gender = await _uow.UserRepository.GetUserGender(User.GetUserId());

            userParams.CurrentUsername = User.GetUserName();

            if(string.IsNullOrEmpty(userParams.Gender)){
                userParams.Gender = gender == "male" ? "female" : "male";
            }

            var users = await _uow.UserRepository.GetMembersAsync(userParams);
            
            Response.AddPaginationHeader(new PaginationHeader(users.CurrentPage,
            users.PageSize, users.TotalCount, users.TotalPages));

            return Ok(users);

        }


        [HttpGet("{userId}")]
        public async Task<ActionResult<MemberDto>> GetUser(int userId)
        {
            return await _uow.UserRepository.GetMemberAsync(userId);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {

            var user = await _uow.UserRepository.GetUserByIdAsync(User.GetUserId());

            if (user == null) return NotFound();

            _mapper.Map(memberUpdateDto, user);

            if (await _uow.Complete()) return NoContent();

            return BadRequest("Failed to update the user");
        }

        [HttpPost("upload-photo")]
        public async Task<ActionResult<PhotoDto>> UploadPhoto(IFormFile file)
        {
            var user = await _uow.UserRepository.GetUserByIdAsync(User.GetUserId());


            if (user == null) return NotFound();

            var result = await _photoService.UploadPhotoAsync(file);

            if (result.Error != null) return BadRequest();

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
            };

            user.Photos.Add(photo);

            if (await _uow.Complete())
            {
                return CreatedAtAction(nameof(GetUser),
                new { username = user.UserName }, _mapper.Map<PhotoDto>(photo));
            }

            return BadRequest("issue with uploading the image to server");

        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<IActionResult> SetMainPhoto(int photoId)
        {
            var user = await _uow.UserRepository.GetUserByIdAsync(User.GetUserId());


            if (user == null) return NotFound();

            var photo = user.Photos.FirstOrDefault(p => p.Id == photoId);

            if (photo == null) return NotFound();

            if (photo.IsMain) return BadRequest("This already the main image");

            var currentMainImage = user.Photos.FirstOrDefault(p => p.IsMain);

            if (currentMainImage != null) currentMainImage.IsMain = false;

            photo.IsMain = true;

            if (await _uow.Complete())
            {
                return NoContent();
            }

            return BadRequest("error when set the main image");
        }

        [HttpDelete("remove-user-photo/{photoId}")]
        public async Task<IActionResult> DeleteUserPhotoAsync(int photoId)
        {
            var user = await _uow.UserRepository.GetUserByIdAsync(User.GetUserId());


            var photo = user.Photos.FirstOrDefault(p => p.Id == photoId);

            if (photo == null) return NotFound("Image not found");

            if (photo.IsMain) return BadRequest("Can't remove main image");

            if (photo.PublicId != null)
            {
                var result = await _photoService.DeletePhotoAsync(photo.PublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
            }

            user.Photos.Remove(photo);

            if (await _uow.Complete()) return Ok();

            return BadRequest("Error while remove photo");
        }

    }
}