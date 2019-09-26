import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bs-nav',
  templateUrl: './bs-nav.component.html',
  styleUrls: ['./bs-nav.component.css']
})
export class BsNavComponent implements OnInit {
  model: any = {};

  constructor(public authService: AuthService, private toastr: ToastrService) {}

  ngOnInit() {}

  login() {
    this.authService.login(this.model).subscribe(next => {
      this.toastr.success('loggedIn sucessfully', 'Success');
    }, error => {
      this.toastr.error('Failed to login', 'Error');
      console.log(error);
    });
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  logout() {
    this.authService.logout();
    this.toastr.info('logged Out', 'Info');
  }
}
