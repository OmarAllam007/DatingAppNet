import {Component, Input, OnInit} from '@angular/core';
import {Member} from "../../_models/member";
import {faEnvelope, faHeart, faUser} from '@fortawesome/free-solid-svg-icons';
import {MembersService} from "../../_services/members.service";
import {ToastrService} from "ngx-toastr";
import {add} from "ngx-bootstrap/chronos";
import {PresenceService} from "../../_services/presence.service";

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() member: Member | undefined;

  constructor(private memberService: MembersService,
              private toasterService: ToastrService,
              public presenceService:PresenceService) {
  }

  ngOnInit(): void {
  }

  addLike(member: Member) {
    this.memberService.addLike(member.id)
      .subscribe({
        next: () => {
          this.toasterService.success("you have liked " + member.knownAs)
        }
      });
  }

  protected readonly faUser = faUser;
  protected readonly faHeart = faHeart;
  protected readonly faEnvelope = faEnvelope;
  protected readonly add = add;
}
