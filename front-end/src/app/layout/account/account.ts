import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserServices } from '../../core/services/user.services';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './account.html',
  styleUrls: ['./account.css']
})
export class Account implements OnInit, OnDestroy {
  user: any = null;
  tokenData: any = null;
  isLoading = false;
  isEditing = false;
  isChangingPassword = false;
  errorMessage: string = '';
  successMessage: string = '';

  editData = {
    name: '',
    email: ''
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  private subscriptions: Subscription = new Subscription();

  constructor(
    private _authService: AuthService,
    private _userService: UserServices,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // دالة تسجيل الخروج العامة
  logout(): void {
    this._authService.logOut();
    this._router.navigate(['/home']);
  }

  loadUserData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const tokenSub = this._authService.getUserData().subscribe({
      next: (tokenData) => {
        if (tokenData) {
          this.tokenData = tokenData;
          this.loadFullUserData();
        } else {
          this.isLoading = false;
          this._router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        console.error('Error loading token data:', error);
        this.errorMessage = 'Failed to load user data. Please try again.';
        this.isLoading = false;
      }
    });

    this.subscriptions.add(tokenSub);
  }

  loadFullUserData(): void {
    const userSub = this._userService.getUser().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.user = response.data;
          this.editData = {
            name: this.user.name || '',
            email: this.user.email || ''
          };
        } else {
          this.user = this.tokenData;
          this.editData = {
            name: this.tokenData.name || '',
            email: this.tokenData.email || ''
          };
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading full user data:', error);
        this.errorMessage = 'Failed to load user profile. Please try again.';
        this.user = this.tokenData;
        this.editData = {
          name: this.tokenData.name || '',
          email: this.tokenData.email || ''
        };
        this.isLoading = false;
      }
    });

    this.subscriptions.add(userSub);
  }

  startEditing(): void {
    this.isEditing = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.isChangingPassword = false;
    this.resetForms();
    this.errorMessage = '';
    this.successMessage = '';
  }

  startChangingPassword(): void {
    this.isChangingPassword = true;
    this.isEditing = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveProfile(): void {
    if (!this.validateProfileForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateSub = this._userService.updateUser(this.editData).subscribe({
      next: (response) => {
        this.user = response.data;
        this.isEditing = false;
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully!';
        this.resetForms();

        // تحديث بيانات التوكن إذا تم تغيير الاسم
        const token = this._authService.getToken();
        if (token) {
          const decode = this._authService.tokenDecode(token);
          if (decode) {
            this.tokenData = decode;
          }
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        this.isLoading = false;
      }
    });

    this.subscriptions.add(updateSub);
  }

  savePassword(): void {
    if (!this.validatePasswordForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const passwordSub = this._userService.updatePassword(this.passwordData).subscribe({
      next: (response) => {
        this.isChangingPassword = false;
        this.isLoading = false;
        this.successMessage = 'Password updated successfully!';
        this.resetForms();

        // تسجيل الخروج وإعادة تسجيل الدخول

      },
      error: (error) => {
        console.error('Error updating password:', error);
        this.errorMessage = error.error?.message || 'Failed to update password. Please try again.';
        this.isLoading = false;
      }
    });

    this.subscriptions.add(passwordSub);
  }

  validateProfileForm(): boolean {
    if (!this.editData.name.trim()) {
      this.errorMessage = 'Name is required';
      return false;
    }

    if (!this.editData.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    return true;
  }

  validatePasswordForm(): boolean {
    if (!this.passwordData.currentPassword) {
      this.errorMessage = 'Current password is required';
      return false;
    }

    if (!this.passwordData.newPassword) {
      this.errorMessage = 'New password is required';
      return false;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters long';
      return false;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    if (this.passwordData.currentPassword === this.passwordData.newPassword) {
      this.errorMessage = 'New password must be different from current password';
      return false;
    }

    return true;
  }

  resetForms(): void {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (this.user) {
      this.editData = {
        name: this.user.name || '',
        email: this.user.email || ''
      };
    }
  }

  getRoleDisplayName(role: string): string {
    return role === 'admin' ? 'Administrator' : 'User';
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
