using System.Text.RegularExpressions;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IMessageRepository
{
    void AddMessage(Message message);
    void DeleteMessage(Message message);
    Task<Message> GetMessage(int userId);

    Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams);
    Task<IEnumerable<MessageDto>> GetMessageThread(int currentUserId, int recipientId);
    

    void AddGroup(ConnectionGroup group);
    void RemoveConnection(Connection connection);

    Task<Connection> GetConnection(string connectionId);
    Task<ConnectionGroup> GetMessageGroup(string groupName);
    Task<ConnectionGroup> GetGroupForConnection(string connectionId);
}