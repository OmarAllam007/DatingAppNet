using System.Text.RegularExpressions;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MessageRepository : IMessageRepository
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;

    public MessageRepository(DataContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public void AddMessage(Message message)
    {
        _context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        _context.Messages.Remove(message);
    }

    public async Task<Message> GetMessage(int userId)
    {
        return await _context.Messages.FindAsync(userId);
    }

    public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
    {
        var query = _context.Messages.OrderBy(m => m.MessageSent).AsQueryable();

        query = messageParams.Container switch
        {
            "Inbox" => query.Where(m => m.RecipientId == messageParams.UserId && m.RecipientDeleted == false),
            "Sent" => query.Where(m => m.SenderId == messageParams.UserId && m.SenderDeleted == false),
            _ => query.Where(m => m.RecipientId == messageParams.UserId
                                  && m.RecipientDeleted == false && m.DateRead == null),
        };

        var messages = query
            .ProjectTo<MessageDto>(_mapper.ConfigurationProvider);

        return await PagedList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
    }

    //1,2
    //lisa,karen
    public async Task<IEnumerable<MessageDto>> GetMessageThread(int currentUserId, int recipientId)
    {
        var query =  _context.Messages
            .Where(
                m =>
                    m.RecipientId == currentUserId && m.SenderId == recipientId && m.RecipientDeleted == false
                    || m.SenderId == currentUserId && m.RecipientId == recipientId && m.SenderDeleted == false
            )
            .OrderBy(m=>m.MessageSent)
            .AsQueryable();

        var unreadMessages = query.Where(m => m.DateRead == null
                                                 && m.RecipientId == currentUserId).ToList();
        if (unreadMessages.Any())
        {
            foreach (var message in unreadMessages)
            {
                message.DateRead = DateTime.UtcNow;
            }

        }
        
        return await query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider).ToListAsync();
    }


    public void AddGroup(ConnectionGroup group)
    {
        _context.ConnectionGroups.Add(group);
    }

    public void RemoveConnection(Connection connection)
    {
        _context.Connections.Remove(connection);
    }

    public async Task<Connection> GetConnection(string connectionId)
    {
        return await _context.Connections.FindAsync(connectionId);
    }

    public async Task<ConnectionGroup> GetMessageGroup(string groupName)
    {
        return await _context.ConnectionGroups
            .Include(x => x.Connections)
            .FirstOrDefaultAsync(x => x.Name == groupName);
    }

    public async Task<ConnectionGroup> GetGroupForConnection(string connectionId)
    {
        return await _context.ConnectionGroups
            .Include(cg => cg.Connections)
            .Where(x => x.Connections.Any(c => c.ConnectionId == connectionId))
            .FirstOrDefaultAsync();
    }
}