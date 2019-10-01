import { AuthService } from './../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { User } from '../models/user';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MemberEditResolver implements Resolve<User> {
    constructor(private userService: UserService, private router: Router, private toastr: ToastrService,
                private authService: AuthService) {}

    resolve(): Observable<User> {
        return this.userService.getUser(this.authService.decodedToken.nameid).pipe(
            catchError(error => {
                this.toastr.error('Error Getting User Details');
                this.router.navigate(['/members']);
                return of(null);
            })
        );
    }
}
``