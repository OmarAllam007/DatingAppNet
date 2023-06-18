import {Component, Input, OnInit} from '@angular/core';
import {Member} from "../../_models/member";
import {faEnvelope, faHeart, faUser} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit{
  @Input() member:Member | undefined;

  constructor() {
  }
  ngOnInit(): void {
  }

  protected readonly faUser = faUser;
  protected readonly faHeart = faHeart;
  protected readonly faEnvelope = faEnvelope;
}
