import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bs-nav',
  templateUrl: './bs-nav.component.html',
  styleUrls: ['./bs-nav.component.css']
})
export class BsNavComponent implements OnInit {
  model: any = {};

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  login() {
    this.authService.login(this.model).subscribe(next => {
      console.log('Logged in successfully');
    }, error => {
      console.log(error);
    });
  }

  loggedIn() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  logout() {
    localStorage.removeItem('token');
    console.log('logged out');
  }
}
