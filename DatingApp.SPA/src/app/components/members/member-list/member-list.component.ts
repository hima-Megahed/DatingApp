import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { Pagination } from 'src/app/models/Pagination';
import { PageChangedEvent } from 'ngx-bootstrap/pagination/ngx-bootstrap-pagination';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  users: User[];
  pagination: Pagination;
  user: User = JSON.parse(localStorage.getItem('user'));
  genderList = [{value: 'all', display: 'All'}, {value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}];
  userParams: any = {};

  constructor(private route: ActivatedRoute, private userService: UserService, private toastr: ToastrService) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.users = data.users.result;
      this.pagination = data.users.pagination;
    });

    this.userParams.gender = 'all';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.userParams.orderBy = 'lastActive';
  }

  pageChanged(event: PageChangedEvent): void {
    this.pagination.currentPage = event.page;
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, this.userParams).subscribe(response => {
      this.users = response.result;
      this.pagination = response.pagination;
    }, error => {
      this.toastr.error('Couldn\'t load another patch of users');
    });
  }

  resetFilters() {
    this.userParams.gender = 'all';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.userParams.orderBy = 'lastActive';
    this.loadUsers();
  }
}
