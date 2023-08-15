namespace API.SingalR;

public class PresenceTracker
{
    private static readonly Dictionary<string, List<string>> OnlineUsers = new();


    public Task<bool> UserConnected(int userId, string connectionId)
    {
        bool isOnline = false;
        
        lock (OnlineUsers)
        {
            if (OnlineUsers.ContainsKey(userId.ToString()))
            {
                OnlineUsers[userId.ToString()].Add(connectionId);
            }
            else
            {
                OnlineUsers.Add(userId.ToString(), new List<string> { connectionId });
                isOnline = true;
            }

            return Task.FromResult(isOnline);
        }
    }

    public Task<bool> UserDisconnected(int userId, string connectionId)
    {
        bool isOffline = false;
        
        lock (OnlineUsers)
        {
            if (!OnlineUsers.ContainsKey(userId.ToString()))
            {
                return Task.FromResult(false);
                
            }
            OnlineUsers[userId.ToString()].Remove(connectionId);

            if (OnlineUsers[userId.ToString()].Count == 0)
            {
                OnlineUsers.Remove(userId.ToString());
                isOffline = true;
            }


            return Task.FromResult(isOffline);
        }
    }

    public Task<string[]> GetOnlineUsers()
    {
        string[] onlineUsers;
        lock (OnlineUsers)
        {
            onlineUsers = OnlineUsers.OrderBy(k => k.Key)
                .Select(k => k.Key)
                .ToArray();
        }

        return Task.FromResult(onlineUsers);
    }


    public static Task<List<string>> GetConnectionsForUser(string userId)
    {
        List<string> connectionIds;
// OnlineUsers should be in database
        lock (OnlineUsers)
        {
            connectionIds = OnlineUsers.GetValueOrDefault(userId);
        }

        return Task.FromResult(connectionIds);
    }
}