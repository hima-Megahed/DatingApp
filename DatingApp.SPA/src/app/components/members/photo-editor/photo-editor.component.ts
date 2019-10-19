import { ToastrService } from 'ngx-toastr';
import { UserService } from './../../../services/user.service';
import { MemberDetailComponent } from './../member-detail/member-detail.component';
import { AuthService } from './../../../services/auth.service';
import { environment } from './../../../../environments/environment';
import { Photo } from './../../../models/Photo';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: Photo[];
  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  currentMainPhoto: Photo;

  constructor(private authService: AuthService, private userService: UserService, private toastrService: ToastrService) { }

  ngOnInit() {
    this.intializeUploader();
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  intializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/' + this.authService.decodedToken.nameid + '/photos',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = file => {
      file.withCredentials = false;
    };

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const res: Photo = JSON.parse(response);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: res.isMain
        };
        this.photos.push(photo);
        console.log('photo', photo);
        
        if (photo.isMain) {
          this.authService.changeMemberPhoto(photo.url);
          this.authService.curentUser.photoUrl = photo.url;
          localStorage.setItem('user', JSON.stringify(this.authService.curentUser));
        }
      }
    };
  }

  setMainPhoto(photo: Photo) {
    this.userService.setMainPhoto(this.authService.decodedToken.nameid, photo.id).subscribe(() => {
      this.currentMainPhoto = this.photos.filter(p => p.isMain === true)[0];
      this.currentMainPhoto.isMain = false;
      photo.isMain = true;
      this.authService.changeMemberPhoto(photo.url);
      this.authService.curentUser.photoUrl = photo.url;
      localStorage.setItem('user', JSON.stringify(this.authService.curentUser));
    },
      error => { });
  }

  deletePhoto(id: number) {
    if (confirm('Are you sure to delete this photo?')) {
      this.userService.deletePhoto(this.authService.decodedToken.nameid, id).subscribe(() => {
        this.photos.splice(this.photos.findIndex(p => p.id === id), 1);
        this.toastrService.success('Photo has been deleted');
      }, error => {
        this.toastrService.error('Failed to delete the photo');
      });
    }
  }
}