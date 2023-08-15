import {Injectable, OnInit} from '@angular/core';
import {environment} from "../../environments/environment.development";
import {HttpClient} from "@angular/common/http";
import {getPaginatedHeader, getPaginatedResults} from "../_models/paginationHelper";
import {Message} from "../_models/message";
import {HttpTransportType, HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {User} from "../_models/user";
import {BehaviorSubject, take} from "rxjs";
import {Group} from "../_models/group";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  constructor(private http: HttpClient) {
  }


  createHubConnection(user: User, otherUserId: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUserId, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build()

    this.hubConnection.start().catch(e => console.log(e));

    this.hubConnection.on("ReceiveMessageThread", messages => {
      this.messageThreadSource.next(messages);
    });

    this.hubConnection.on("UpdatedGroup", (group:Group) => {
      if(group.connections.some(x=>x.userId === otherUserId)){
        this.messageThread$.pipe(take(1)).subscribe({
          next:messages => {
            messages.forEach(message=>{
              if(!message.dateRead){
                message.dateRead = new Date(Date.now());
              }
            })
            this.messageThreadSource.next([...messages]);
          }
        })
      }
    });

    this.hubConnection.on("NewMessage", message => {
      this.messageThread$.pipe(take(1)).subscribe({
        next: messages => {
          this.messageThreadSource.next([...messages, message])
        }
      })
    });
  }

  stopHubConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  getMessage(pageNumber: number, pageSize: number, container: string) {
    let params = getPaginatedHeader(pageNumber, pageSize);
    params = params.append('container', container);
    return getPaginatedResults<Message[]>(this.baseUrl + 'messages', params, this.http);
  }


  getMessageThread(userId: number) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + userId);
  }

  async sendMessage(userId: number, content: string) {
    return this.hubConnection?.invoke("SendMessage", {RecipientId: userId, content})
      .then((res)=>{
        console.log(res)
      })
      .catch(err => console.log(err));
  }

  deleteMessage(messageId: number) {
    return this.http.delete(this.baseUrl + 'messages/' + messageId);
  }
}
