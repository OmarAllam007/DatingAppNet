import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {User} from "../../_models/user";
import {Member} from "../../_models/member";
import {AuthService} from "../../_services/AuthService";
import {MembersService} from "../../_services/members.service";
import {take} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  user: User | null = null;
  member: Member | undefined;
  @ViewChild('editForm') editForm: NgForm | undefined;
  @HostListener('window:beforeunload',['$event']) unloadNotification($event:any){
    if (this.editForm?.dirty){
      $event.returnValue = true;
    }
  }
  constructor(private authService: AuthService,
              private memberService: MembersService,
              private toastrService: ToastrService) {
    this.authService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    })

    console.log(this.user)
  }

  ngOnInit(): void {
    this.loadMemberDetails();
  }

  loadMemberDetails() {
    if (!this.user) return;
    this.memberService.getMember(this.user.username).subscribe({
      next: member => this.member = member
    })
  }

  updateMember() {
    this.memberService.updateMember(this.editForm?.value).subscribe({
      next:_=> {
        this.toastrService.success("Profile updated successfully!")
        this.editForm?.reset(this.member);
      }
    })

  }
}
