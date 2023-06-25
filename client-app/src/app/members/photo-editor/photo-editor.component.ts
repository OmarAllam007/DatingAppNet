import {Component, Input, OnInit} from '@angular/core';
import {Member} from "../../_models/member";
import {faTrash, faUpload} from "@fortawesome/free-solid-svg-icons";
import {FileUploader} from "ng2-file-upload";
import {environment} from "../../../environments/environment";
import {User} from "../../_models/user";
import {AuthService} from "../../_services/AuthService";
import {take} from "rxjs";

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() member: Member | undefined;
  uploader: FileUploader | undefined;
  hasBaseDropZoneOver = false;
  hasAnotherDropZoneOver = false;
  baseUrl = environment.apiUrl;
  user: User | undefined;
  response: string = "";

  constructor(private authService: AuthService) {
    this.authService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if (user) {
          this.user = user;
        }
      }
    });
  }

  ngOnInit(): void {
    this.initUploader();
  }

  protected readonly faTrash = faTrash;

  initUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + "users/upload-photo",
      authToken: "Bearer " + this.user?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024,
    });

    this.uploader.onAfterAddingFile = (file)=>{
      file.withCredentials = false
    }

    this.uploader.onSuccessItem = (item,response,status,headers)=>{
      if(response){
        const photo = JSON.parse(response);
        this.member?.photos.push(photo);
      }
    }

  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  protected readonly faUpload = faUpload;
}
