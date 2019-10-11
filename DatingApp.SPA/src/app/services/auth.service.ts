import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../models/user';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl + 'auth';
  private jwtHelper = new JwtHelperService();
  private photoUrl = new BehaviorSubject<string>('../../assets/user.png');
  curentUser: User;
  decodedToken: any;
  currentPhotoUrl = this.photoUrl.asObservable();

  constructor(private http: HttpClient) {}

  login(model: any) {
    return this.http.post(this.baseUrl + '/login', model)
    .pipe(map((response: any) => {
      if (response) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.decodedToken = this.jwtHelper.decodeToken(response.token);
        this.curentUser = response.user;
        this.changeMemberPhoto(this.curentUser.photoUrl);
      }
    }));
  }

  register(model: any) {
    return this.http.post(this.baseUrl + '/register', model);
  }

  loggedIn() {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.curentUser = null;
    this.decodedToken = null;
  }

  changeMemberPhoto(photoUrl: string) {
    this.photoUrl.next(photoUrl);
  }
}
