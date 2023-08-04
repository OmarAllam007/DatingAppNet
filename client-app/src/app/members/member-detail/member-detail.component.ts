import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MembersService} from "../../_services/members.service";
import {Member} from "../../_models/member";
import {ActivatedRoute} from "@angular/router";
import {NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions} from "@kolkov/ngx-gallery";
import {TabDirective, TabsetComponent} from "ngx-bootstrap/tabs";
import {MessageService} from "../../_services/message.service";
import {Message} from "../../_models/message";

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  member: Member = {} as Member;
  galleryOptions: NgxGalleryOptions[] = []
  galleryImages: NgxGalleryImage[] = []

  @ViewChild('memberTabs',{static:true}) memberTabs?: TabsetComponent
  activeTab?: TabDirective;
  userId?: number
  @Input() messages: Message[] = [];

  constructor(private memberService: MembersService,
              private activatedRoute: ActivatedRoute,
              private messageService: MessageService) {
  }

  ngOnInit(): void {
    // this.loadMember();
    this.activatedRoute.data.subscribe({
      next: data => {
        this.member = data['member'];
      }
    })


    this.activatedRoute.queryParams.subscribe({
      next: params=>{
        params['tab'] && this.selectTab(params['tab']);
      }
    })

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false,
      }
    ];

    this.galleryImages = this.getImages();

  }

  private getImages() {
    if (!this.member) return [];
    const imageUrls = [];

    for (const image of this.member.photos) {
      imageUrls.push({
        small: image.url,
        medium: image.url,
        big: image.url,
      })
    }
    return imageUrls;
  }


  selectTab(heading:string){
    if(this.memberTabs){
      this.memberTabs.tabs.find(x=>x.heading === heading)!.active = true;
    }
  }


  onTabSelected(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading == 'Messages') {
      this.loadMessages();
    }
  }

  loadMessages() {
    if (this.member && this.member.id) {
      this.messageService.getMessageThread(this.member.id).subscribe({
        next: messages => {
          this.messages = messages;
        }
      });
    }
  }

}
