import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserService } from './../../../services/user.service';
import { AuthService } from './../../../services/auth.service';
import { Message } from './../../../models/Message';
import { Component, OnInit, Input } from '@angular/core';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() recipientId: number;
  messages: Message[];
  newMessage: any = {};

  constructor(private authService: AuthService, private userService: UserService, private toastr: ToastrService) { }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    const userId = +this.authService.decodedToken.nameid;
    this.userService.getMessagesThread(this.authService.decodedToken.nameid, this.recipientId)
    .pipe(tap(messages => {
      for (const message of messages) {
        if (message.isRead === false && message.recipientId === userId) {
          this.userService.markMessageAsRead(userId, message.id);
          this.userService.updateUnreadMessagesCount();
        }
      }
    }, null, () => this.userService.updateUnreadMessagesCount()))
    .subscribe(messages => {
      this.messages = messages;
    }, error => {
      this.toastr.error(error);
    });
  }

  sendMessage() {
    this.newMessage.recipientId = this.recipientId;
    this.userService.sendMessage(this.authService.decodedToken.nameid, this.newMessage).subscribe(message => {
      this.messages.push(message);
      this.newMessage.content = '';
    });
  }

}
