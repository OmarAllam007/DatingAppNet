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

        var messages = query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider);

        return await PagedList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
    }

    //1,2
    //lisa,karen
    public async Task<IEnumerable<MessageDto>> GetMessageThread(int currentUserId, int recipientId)
    {
        
        var messages = await _context.Messages
            .Include(m => m.Recipient).ThenInclude(u => u.Photos)
            .Include(m => m.Sender).ThenInclude(u => u.Photos)
            .Where(
                m =>
                    m.RecipientId == currentUserId && m.SenderId == recipientId && m.RecipientDeleted == false
                    || m.SenderId == currentUserId && m.RecipientId == recipientId && m.SenderDeleted == false
                    
                    
            ).OrderByDescending(m => m.MessageSent)
            .ToListAsync();

        var unreadMessages = messages.Where(m => m.DateRead == null
                                                 && m.RecipientId == currentUserId).ToList();
        if (unreadMessages.Any())
        {
            foreach (var message in unreadMessages)
            {
                message.DateRead = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        return _mapper.Map<IEnumerable<MessageDto>>(messages);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}