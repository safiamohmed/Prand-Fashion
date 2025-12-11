import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  imports: [ ReactiveFormsModule, RouterLink, CommonModule ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
   signupForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  isLoading = false;

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  signup() {
    if (this.signupForm.valid) {
      const { name, email, password, confirmPassword } = this.signupForm.value;

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      this.isLoading = true;

      // استدعاء خدمة الـ signup
      this._authService.signup({ name, email, password }).subscribe({
        next: (data: any) => {
          console.log('Signup successful:', data);
          this.isLoading = false;
          alert('Account created successfully!');
          this._router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Full error object:', err);
          this.isLoading = false;

          let errorMessage = 'Error creating account';

          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          } else if (err.status === 0) {
            errorMessage = 'Cannot connect to server. Please check if backend is running.';
          } else if (err.status === 400) {
            errorMessage = 'Bad request. Please check your input.';
          } else if (err.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }

          alert(errorMessage);
        }
      });
    } else {
      alert('Please fill all required fields correctly');
    }
  }
}
