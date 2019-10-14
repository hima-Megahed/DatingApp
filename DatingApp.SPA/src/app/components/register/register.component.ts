import { Router } from '@angular/router';
import { User } from './../../models/user';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, EmailValidator, Validators, FormBuilder } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker/public_api';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  model: any = {};
  @Output() cancelRegister = new EventEmitter();
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(private authService: AuthService, private toastr: ToastrService, private formBuilder: FormBuilder,
              private router: Router) { }

  ngOnInit() {
    this.createRegisterForm();
    this.bsConfig = {
      containerClass: 'theme-red'
    };
  }

  createRegisterForm() {
    this.registerForm = this.formBuilder.group({
      gender: ['male', Validators.required],
      userName: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), this.passwordNotTest]],
      confirmPassword: ['', Validators.required],
    }, {
      validators: [this.passwordMatchValidator]
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password').value === form.get('confirmPassword').value ? null : {missmatch: true};
  }

  passwordNotTest(formControl: FormControl) {
    return (formControl.value as string).toLowerCase() !== 'test' ? null : {passwordWeak: true};
  }

  register() {
    if (this.registerForm.valid) {
      const user: User = Object.assign({}, this.registerForm.value);
      this.authService.register(user).subscribe(() => {
        this.toastr.success('Registration successful');
      }, error => {
        this.toastr.error('registration failed', 'Error');
        console.log(error);
      }, () => {
        this.authService.login(user).subscribe(() => {
          this.router.navigate(['/members']);
        });
      });
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
    this.toastr.info('registration canceled', 'Info');
  }

}
