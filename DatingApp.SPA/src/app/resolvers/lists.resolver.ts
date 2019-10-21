import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { User } from '../models/user';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ListsResolver implements Resolve<User[]> {
    pageNumber = 1;
    pageSize = 5;
    likeParams = 'Likers';

    constructor(private userService: UserService, private router: Router, private toastr: ToastrService) {}

    resolve(route: ActivatedRouteSnapshot): Observable<User[]> {
        return this.userService.getUsers(this.pageNumber, this.pageSize, null, this.likeParams).pipe(
            catchError(error => {
                this.toastr.error('Error Getting Users');
                this.router.navigate(['/']);
                return of(null);
            })
        );
    }
}
