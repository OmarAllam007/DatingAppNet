import {ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MessageService} from "../../_services/message.service";
import {faClock, faEnvelopeOpen} from "@fortawesome/free-solid-svg-icons";
import {NgForm} from "@angular/forms";

@Component({
  changeDetection:ChangeDetectionStrategy.OnPush,
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() userId?: number;
  @ViewChild('messageForm') messageForm?:NgForm
  @ViewChild('chat') chat?: ElementRef;

  messageContent:string = '';

  constructor(public messageService: MessageService) {
  }

  ngOnInit(): void {

  }

  sendMessage(){
    if(this.userId){
      this.messageService.sendMessage(this.userId,this.messageContent).then(()=>{
        this.messageForm?.reset();
      })
    }
  }




  protected readonly faEnvelopeOpen = faEnvelopeOpen;
  protected readonly faClock = faClock;
}
