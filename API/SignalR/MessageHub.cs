using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.SingalR;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

[Authorize]
public class MessageHub : Hub
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;
    private readonly IHubContext<PresenceHub> _presenceHub;

    public MessageHub(
        IUnitOfWork uow,
        IMapper mapper,
        IHubContext<PresenceHub> presenceHub)
    {
        _uow = uow;
        _mapper = mapper;
        _presenceHub = presenceHub;
    }

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        if (httpContext != null)
        {
            var otherUser = httpContext.Request.Query["user"];
            var groupName = GetGroupName(Context.User.GetUserId().ToString(), otherUser.ToString());

            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            var group = await AddToGroup(groupName);
            await Clients.Group(groupName).SendAsync("UpdatedGroup", group);
            //could to be changed to username not id
            var messages = await _uow.MessageRepository.GetMessageThread(Context.User.GetUserId(),
                int.Parse(otherUser));
            if (_uow.HasChanges())
            {
                await _uow.Complete();
            }

            await Clients.Groups(groupName).SendAsync("ReceiveMessageThread", messages);
        }
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var group = await RemoveFromMessageGroup();
        await Clients.Group(group.Name).SendAsync("UpdatedGroup", group);

        await base.OnDisconnectedAsync(exception);
    }


    public async Task SendMessage(CreateMessageDto createMessageDto)
    {
        var senderId = Context.User.GetUserId();

        if (senderId == createMessageDto.RecipientId)
            throw new HubException("You can't send message to yourself");

        var sender = await _uow.UserRepository.GetUserByIdAsync(senderId);
        var recipient = await _uow.UserRepository.GetUserByIdAsync(createMessageDto.RecipientId);

        if (recipient == null) throw new HubException("user not found!");

        var message = new Message
        {
            Sender = sender,
            Recipient = recipient,
            SenderUsername = sender.UserName,
            RecipientUsername = recipient.UserName,
            Content = createMessageDto.Content
        };

        var groupName = GetGroupName(sender.Id.ToString(), recipient.Id.ToString());
        var group = await _uow.MessageRepository.GetMessageGroup(groupName);

        if (group.Connections.Any(x => x.Username == recipient.Id.ToString()))
        {
            message.DateRead = DateTime.UtcNow;
        }
        else
        {
            var connections = await PresenceTracker.GetConnectionsForUser(recipient.Id.ToString());

            if (connections != null)
            {
                await _presenceHub.Clients.Clients(connections).SendAsync("NewMessageReceived", new
                {
                    username = sender.UserName, knownAs = sender.KnownAs, userId = sender.Id
                });
            }
        }

        _uow.MessageRepository.AddMessage(message);

        if (await _uow.Complete())
        {
            await Clients.Groups(groupName).SendAsync("NewMessage", _mapper.Map<MessageDto>(message));
        }
    }

    private string GetGroupName(string caller, string otherUser)
    {
        var stringCompare = string.CompareOrdinal(caller, otherUser) < 0;
        return stringCompare ? $"{caller}-{otherUser}" : $"{otherUser}-{caller}";
    }

    private async Task<ConnectionGroup> AddToGroup(string groupName)
    {
        var group = await _uow.MessageRepository.GetMessageGroup(groupName);
        var connection = new Connection(Context.ConnectionId, Context.User.GetUserId().ToString());

        if (group == null)
        {
            group = new ConnectionGroup(groupName);
            _uow.MessageRepository.AddGroup(group);
        }

        group.Connections.Add(connection);
        if (await _uow.Complete())
        {
            return group;
        }

        throw new HubException("can't add to the group!");
    }

    private async Task<ConnectionGroup> RemoveFromMessageGroup()
    {
        var group = await _uow.MessageRepository.GetGroupForConnection(Context.ConnectionId);
        var connection = group.Connections.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
        // var connection = await _uow.MessageRepository.GetConnection(Context.ConnectionId);
        _uow.MessageRepository.RemoveConnection(connection);

        if (await _uow.Complete()) return group;

        throw new HubException("can't remove to the group!");
    }
}