import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(private _authService: AuthService) {}

  login() {
    console.log(this.loginForm.value);
    this._authService.login(this.loginForm.value).subscribe({
      next: (data) => {
        // console.log(data);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
