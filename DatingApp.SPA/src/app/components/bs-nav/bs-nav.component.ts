import { Observable, Subscription } from 'rxjs';
import { UserService } from './../../services/user.service';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bs-nav',
  templateUrl: './bs-nav.component.html',
  styleUrls: ['./bs-nav.component.css']
})
export class BsNavComponent implements OnInit {
  model: any = {};
  photoUrl: string;
  unreadMessagesCount: number;

  constructor(public authService: AuthService, private userService: UserService,
              private toastr: ToastrService, private router: Router) {}

  ngOnInit() {
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
    this.userService.updateUnreadMessagesCount();
    this.userService.unreadMessagesCount.subscribe(count => {
      this.unreadMessagesCount = count;
    });
  }

  login() {
    this.authService.login(this.model).subscribe(next => {
      this.toastr.success('loggedIn sucessfully', 'Success');
    }, error => {
      this.toastr.error('Failed to login', 'Error');
      console.log(error);
    }, () => {
      this.userService.updateUnreadMessagesCount();
      this.router.navigate(['/members']);
    });
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  logout() {
    this.authService.logout();
    this.toastr.info('logged Out', 'Info');
    this.router.navigate(['/home']);
  }
}
