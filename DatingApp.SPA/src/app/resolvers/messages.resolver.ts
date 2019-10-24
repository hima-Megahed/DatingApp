import { MessageContainer } from './../helpers/enums/MessageContainer.enum';
import { AuthService } from 'src/app/services/auth.service';
import { Message } from './../models/Message';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { User } from '../models/user';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MessagesResolver implements Resolve<Message[]> {
    pageNumber = 1;
    pageSize = 5;
    messageContainer = MessageContainer.Unread;

    constructor(private userService: UserService, private router: Router,
                private authService: AuthService,  private toastr: ToastrService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<Message[]> {
        return this.userService.getMessages(this.authService.decodedToken.nameid, this.pageNumber,
            this.pageSize, this.messageContainer).pipe(
            catchError(error => {
                this.toastr.error('Error Getting messages');
                this.router.navigate(['/']);
                return of(null);
            })
        );
    }
}
