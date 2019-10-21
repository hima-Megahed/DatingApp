import { AuthService } from './../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from './../../../services/user.service';
import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() user: User;

  constructor(private userService: UserService, private toastr: ToastrService, private authService: AuthService) { }

  ngOnInit() {
  }

  sendLike(recepientId: number) {
    this.userService.sendLike(this.authService.decodedToken.nameid, recepientId)
    .subscribe(() => {
      this.toastr.success('You have liked: ' + this.user.knownAs);
    }, error => {
      this.toastr.error(error);
    });
  }

}
