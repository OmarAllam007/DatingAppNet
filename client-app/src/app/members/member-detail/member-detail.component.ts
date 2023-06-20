import {Component, OnInit} from '@angular/core';
import {MembersService} from "../../_services/members.service";
import {Member} from "../../_models/member";
import {ActivatedRoute} from "@angular/router";
import {NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions} from "@kolkov/ngx-gallery";

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  member: Member | undefined
  galleryOptions:NgxGalleryOptions[] = []
  galleryImages:NgxGalleryImage[] = []
  constructor(private memberService: MembersService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.loadMember();
    this.galleryOptions = [
      {
        width:'500px',
        height:'500px',
        imagePercent:100,
        thumbnailsColumns:4,
        imageAnimation:NgxGalleryAnimation.Slide,
        preview:false,
      }
    ];

  }

  private getImages() {
    if(!this.member) return [];
    const imageUrls = [];

    for (const image of this.member.photos) {
      imageUrls.push({
        small:image.url,
        medium:image.url,
        big:image.url,
      })
    }
    return imageUrls;
  }

  loadMember() {
    const username = this.activatedRoute.snapshot.paramMap.get('username');
    if (!username) return;

    this.memberService.getMember(username).subscribe({
      next: member => {
        this.member = member
        this.galleryImages = this.getImages();

      }
    })

  }


}
