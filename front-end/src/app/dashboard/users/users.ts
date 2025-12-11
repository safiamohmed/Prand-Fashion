import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserServices } from '../../core/services/user.services';
import { IUser } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {
  users: IUser[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private _userService: UserServices,
    private _fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';

    const usersObservable = this._userService.getAllUsers();

    if (usersObservable) {
      usersObservable.subscribe({
        next: (response) => {
          // response.data تحتوي على array من IUser
          this.users = response.data || [];
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load users. Please try again.';
          this.isLoading = false;
          console.error('Error loading users:', error);
        }
      });
    } else {
      this.errorMessage = 'Authentication required. Please login again.';
      this.isLoading = false;
    }
  }
}
