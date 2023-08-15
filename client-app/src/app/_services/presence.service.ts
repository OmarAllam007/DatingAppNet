import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment.development";
import {HttpTransportType, HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {ToastrService} from "ngx-toastr";
import {User} from "../_models/user";
import {BehaviorSubject, take} from "rxjs";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();


  constructor(private toasterService: ToastrService, private router: Router) {
  }

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory(): string | Promise<string> {
          return user.token;
        }
      })
      .withAutomaticReconnect()
      .build()

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on("UserOnline", data => {

      this.onlineUsers$.pipe(take(1)).subscribe({
        next: names => {
          console.log(names)
          this.onlineUsersSource.next([...names, data.id.toString()])
        }
      })
      // this.toasterService.info(data.username + ' has connected');
    });

    this.hubConnection.on("UserOffline", data => {
      this.onlineUsers$.pipe(take(1)).subscribe({
        next: (names) => {
          this.onlineUsersSource.next(names.filter(x => x.toString() !== data.id.toString()))
        }
      })
      // this.toasterService.info(data.username + 'has disconnected');
    })

    this.hubConnection.on("GetOnlineUsers", users => {
      this.onlineUsersSource.next(users)
    })

    this.hubConnection.on("NewMessageReceived", (data) => {
      this.toasterService.info(data.knownAs + 'has sent you a message! Click to see it')
        .onTap.pipe(take(1)).subscribe({
        next: () => this.router.navigateByUrl('/members/' + data.userId + '?tab=Messages')
      })
    })
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch(error => console.log(error));
  }
}
