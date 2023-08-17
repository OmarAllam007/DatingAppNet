using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class MessagesController : BaseApiController
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public MessagesController(
        IUnitOfWork uow,
        IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var senderId = User.GetUserId();

        if (senderId == createMessageDto.RecipientId)
            return BadRequest("You can't send message to yourself");

        var sender = await _uow.UserRepository.GetUserByIdAsync(senderId);

        var recipient = await _uow.UserRepository.GetUserByIdAsync(createMessageDto.RecipientId);

        if (recipient == null) return NotFound();

        var message = new Message
        {
            Sender = sender,
            Recipient = recipient,
            SenderUsername = sender.UserName,
            RecipientUsername = recipient.UserName,
            Content = createMessageDto.Content
        };

        _uow.MessageRepository.AddMessage(message);

        if (await _uow.Complete())
        {
            return Ok(_mapper.Map<MessageDto>(message));
        }

        return BadRequest("Failed to send message");
    }

    [HttpGet]
    public async Task<ActionResult<PagedList<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams)
    {
        messageParams.UserId = User.GetUserId();

        var messages = await _uow.MessageRepository.GetMessagesForUser(messageParams);
        Response.AddPaginationHeader(
            new PaginationHeader(messages.CurrentPage, messages.PageSize,
                messages.TotalCount, messages.TotalPages)
        );

        return messages;
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(int id)
    {
        var userId = User.GetUserId();
        var message = await _uow.MessageRepository.GetMessage(id);

        if (message.RecipientId != userId && message.SenderId != userId)
            return Unauthorized();

        if (message.SenderId == userId)
            message.SenderDeleted = true;

        if (message.RecipientId == userId)
            message.RecipientDeleted = true;

        if (message.SenderDeleted && message.RecipientDeleted)
            _uow.MessageRepository.DeleteMessage(message);

        if (await _uow.Complete()) return Ok();

        return BadRequest("Problem with removing the message");
    }
}