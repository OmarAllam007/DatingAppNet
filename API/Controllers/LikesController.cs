using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class LikesController : BaseApiController
{
    private readonly IUserRepository _userRepository;
    private readonly ILikesRepository _likesRepository;

    public LikesController(IUserRepository userRepository, ILikesRepository likesRepository)
    {
        _userRepository = userRepository;
        _likesRepository = likesRepository;
    }

    [HttpPost("{userId}")]
    public async Task<ActionResult> AddLike(int userId)
    {
        var sourceUserId = User.GetUserId();
        var likedUser = await _userRepository.GetUserByIdAsync(userId);
        
        var sourceUser = await _likesRepository.GetUserWithLikes(sourceUserId);

        if (likedUser == null) return NotFound();
        if (sourceUser.Id == userId) return BadRequest("You can't like yourself");

        var userLike = await _likesRepository.GetUserLike(sourceUserId, likedUser.Id);

        if (userLike != null) return BadRequest("You are already liked this user");

        var newUserLike = new UserLike()
        {
            
            SourceUserId = sourceUserId,
            TargetUserId = likedUser.Id
        };
        
        sourceUser.LikedUsers.Add(newUserLike);

        if (await _userRepository.SaveAllAsync())
        {
            return Ok();
        }

        return BadRequest();
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes(string predicate)
    {
        var users = await _likesRepository.GetUserLikes(predicate, User.GetUserId());
        return Ok(users);
    }
}