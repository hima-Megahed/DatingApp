import { ToastrService } from 'ngx-toastr';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  model: any = {};
  @Output() cancelRegister = new EventEmitter();

  constructor(private authService: AuthService, private toastr: ToastrService) { }

  ngOnInit() {
  }

  register() {
    this.authService.register(this.model).subscribe(() => {
      this.toastr.success('registration successful', 'Success');
    }, error => {
      this.toastr.error('registration failed', 'Error');
      console.log(error);
    });

  }

  cancel() {
    this.cancelRegister.emit(false);
    this.toastr.info('registration canceled', 'Info');
  }

}
