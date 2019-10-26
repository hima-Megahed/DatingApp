import { AuthService } from 'src/app/services/auth.service';
import { Message } from './../models/Message';
import { map, take } from 'rxjs/operators';
import { PaginationResult } from './../models/Pagination';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl = environment.apiUrl;
  private UnreadMessagesCount = new BehaviorSubject<number>(0);
  unreadMessagesCount = this.UnreadMessagesCount.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUsers(page?: any, itemsPerPage?: any, userParams?: any, likeParams?: any): Observable<PaginationResult<User[]>> {
    const paginationResult: PaginationResult<User[]> = new PaginationResult<User[]>();
    let params = new HttpParams();

    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }

    if (userParams != null) {
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
    }

    if (likeParams === 'Likers') {
      params = params.append('likers', 'true');
    }

    if (likeParams === 'Likees') {
      params = params.append('likees', 'true');
    }

    return this.http
      .get<User[]>(this.baseUrl + 'users', { observe: 'response', params })
      .pipe(
        map(response => {
          paginationResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginationResult.pagination = JSON.parse(
              response.headers.get('Pagination')
            );
          }
          return paginationResult;
        })
      );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(this.baseUrl + 'users/' + id);
  }

  updateUser(id: number, user: User) {
    return this.http.put(this.baseUrl + 'users/' + id, user);
  }

  setMainPhoto(userId: number, photoId: number) {
    return this.http.post(
      this.baseUrl + 'users/' + userId + '/photos/' + photoId + '/setMain',
      {}
    );
  }

  deletePhoto(userId: number, photoId: number) {
    return this.http.delete(this.baseUrl + 'users/' + userId + '/photos/' + photoId);
  }

  sendLike(userId: number, recipientId: number) {
    return this.http.post(this.baseUrl + 'users/' + userId + '/like/' + recipientId, {});
  }

  getMessages(userId: number, page?, itemsPerPage?, messageContainer?) {
    const paginationResult: PaginationResult<Message[]> = new PaginationResult<Message[]>();

    let params = new HttpParams();

    if (messageContainer != null) {
      params = params.append('MessageContainerType', messageContainer);
    }

    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }

    return this.http.get<Message[]>(this.baseUrl + 'users/' + userId + '/messages', {observe: 'response', params})
    .pipe(
      map(response => {
        paginationResult.result = response.body;

        if (response.headers.get('Pagination') != null) {
          paginationResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }

        return paginationResult;
      })
    );
  }

  getMessagesThread(userId: number, recipientId: number) {
    return this.http.get<Message[]>(this.baseUrl + 'users/' + userId + '/messages/thread/' + recipientId);
  }

  sendMessage(userId: number, message: Message) {
    return this.http.post<Message>(this.baseUrl + 'users/' + userId + '/messages', message);
  }

  deleteMessage(userId: number, messageId: number) {
    return this.http.post(this.baseUrl + 'users/' + userId + '/messages/' + messageId, {});
  }

  markMessageAsRead(userId: number, messageId: number) {
    return this.http.post(this.baseUrl + 'users/' + userId + '/messages/' + messageId + '/read', {}).subscribe();
  }

  updateUnreadMessagesCount() {
    let newCount: number;
    if (localStorage.getItem('user') != null) {
      this.getUnreadMessagesCount(this.authService.curentUser.id).pipe(take(1)).subscribe(count => {
        newCount = count;
        this.UnreadMessagesCount.next(newCount);
      });
    }
  }

  private getUnreadMessagesCount(userId: number) {
    return this.http.get<number>(this.baseUrl + 'users/' + userId + '/messages/unread');
  }
}
