import {Injectable, OnInit} from '@angular/core';
import {environment} from "../../environments/environment.development";
import {HttpClient} from "@angular/common/http";
import {getPaginatedHeader, getPaginatedResults} from "../_models/paginationHelper";
import {Message} from "../_models/message";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;


  constructor(private http: HttpClient) {
  }

  getMessage(pageNumber: number, pageSize: number, container: string) {
    let params = getPaginatedHeader(pageNumber, pageSize);
    params = params.append('container', container);
    return getPaginatedResults<Message[]>(this.baseUrl + 'messages', params, this.http);
  }


  getMessageThread(userId: number) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + userId);
  }

  sendMessage(userId: number, content: string) {
    return this.http.post<Message>(this.baseUrl + 'messages', {recipientId: userId, content})
  }

  deleteMessage(messageId: number) {
    return this.http.delete(this.baseUrl + 'messages/' + messageId);
  }
}
