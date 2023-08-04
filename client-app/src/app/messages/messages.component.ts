import {Component, OnInit} from '@angular/core';
import {Message} from "../_models/message";
import {Pagination} from "../_models/pagination";
import {MessageService} from "../_services/message.service";
import {faEnvelope, faEnvelopeOpen, faPaperPlane} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages?: Message[];
  pageNumber = 1;
  pageSize = 5;
  pagination?: Pagination;
  container = "Unread";
  loading = false;

  constructor(private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.loading = true;
    this.messageService.getMessage(this.pageNumber, this.pageSize, this.container).subscribe(
      {
        next: response => {
          this.messages = response.result;
          this.pagination = response.pagination;
          this.loading = false;
        }
      }
    );
  }

  pageChanged($event: any) {
    if (this.pageNumber != $event.page) {
      this.pageNumber = $event.page;
      this.loadMessages();
    }

  }

  deleteMessage(messageId: number) {
    this.messageService.deleteMessage(messageId).subscribe({
      next: () => this.messages?.splice(this.messages?.findIndex(m =>
        m.id === messageId), 1)
    })
  }


  protected readonly faEnvelope = faEnvelope;
  protected readonly faEnvelopeOpen = faEnvelopeOpen;
  protected readonly faPaperPlane = faPaperPlane;
}
