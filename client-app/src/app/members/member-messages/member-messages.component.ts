import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Message} from "../../_models/message";
import {MessageService} from "../../_services/message.service";
import {faClock, faEnvelopeOpen} from "@fortawesome/free-solid-svg-icons";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() userId?: number;
  @Input() messages: Message[] = [];
  @ViewChild('messageForm') messageForm?:NgForm
  messageContent:string = '';

  constructor(private messageService: MessageService) {
  }

  ngOnInit(): void {

  }

  sendMessage(){
    if(this.userId){
      this.messageService.sendMessage(this.userId,this.messageContent).subscribe({
        next: message =>{
          this.messages.push(message);
          this.messageForm?.reset();
        }
      })
    }
  }




  protected readonly faEnvelopeOpen = faEnvelopeOpen;
  protected readonly faClock = faClock;
}
