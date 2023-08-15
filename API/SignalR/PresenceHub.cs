using API.Extensions;
using Microsoft.AspNetCore.SignalR;

namespace API.SingalR;

public class PresenceHub : Hub
{
    private readonly PresenceTracker _presenceTracker;

    public PresenceHub(PresenceTracker presenceTracker)
    {
        _presenceTracker = presenceTracker;
    }


    public override async Task OnConnectedAsync()
    {
        var isOnline = await _presenceTracker.UserConnected(Context.User.GetUserId(), Context.ConnectionId);

        if (isOnline)
        {
            await Clients.Others.SendAsync("UserOnline", new
            {
                Id = Context.User.GetUserId(),
                Username = Context.User.GetUserName(),
            });
        }
        
        var currentUsers = await _presenceTracker.GetOnlineUsers();
        await Clients.Caller.SendAsync("GetOnlineUsers", currentUsers);
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var isOffline = await _presenceTracker.UserDisconnected(Context.User.GetUserId(), Context.ConnectionId);
        
        if (isOffline)
        {
            await Clients.Others.SendAsync("UserOffline", new
            {
                Id = Context.User.GetUserId(),
                Username = Context.User.GetUserName(),
            });    
        }

        
        // var currentUsers = await _presenceTracker.GetOnlineUsers();
        // await Clients.Caller.SendAsync("GetOnlineUsers", currentUsers);

        await base.OnDisconnectedAsync(exception);
    }
}