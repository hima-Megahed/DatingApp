import { MessageContainer } from './../../helpers/enums/MessageContainer.enum';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './../../services/auth.service';
import { UserService } from './../../services/user.service';
import { Message } from './../../models/Message';
import { Component, OnInit } from '@angular/core';
import { Pagination } from 'src/app/models/Pagination';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainerParam = MessageContainer.Unread;
  messageContainerTypes = MessageContainer;
  constructor(private userService: UserService, private authService: AuthService,
              private toastr: ToastrService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.messages = data.messages.result;
      this.pagination = data.messages.pagination;
    });
  }

  loadMessages() {
    this.userService.getMessages(this.authService.decodedToken.nameid, this.pagination.currentPage,
      this.pagination.itemsPerPage, this.messageContainerParam).subscribe(messages => {
        this.messages = messages.result;
        this.pagination = messages.pagination;
    }, error => {
      this.toastr.error(error);
    });
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }

  deleteMessage(messageId: number) {
    if (confirm('Are you sure you want to delete this message?')) {
      this.userService.deleteMessage(this.authService.decodedToken.nameid, messageId).subscribe(() => {
        this.messages.splice(this.messages.findIndex(m => m.id === messageId), 1);
        this.userService.updateUnreadMessagesCount();
        this.toastr.success('Message deleted successfully');
      }, error => {
        this.toastr.error(error);
      });
    }
  }

}
