import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { AuthService } from './auth.service';
import {
  IUser,
  IUserResponse,
  IUpdateUserData,
  IUpdatePasswordData
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserServices {
  constructor(
    private _http: HttpClient,
    private _auth: AuthService
  ) {}

  private apiURL = environment.apiURL + '/user';

  // الحصول على بيانات المستخدم الحالي
  getUser(): Observable<{ message: string; data: IUser }> {
    return this._http.get<{ message: string; data: IUser }>(
      `${this.apiURL}/me/profile`,
      this.getHeaders()
    );
  }

  // تحديث بيانات المستخدم الحالي
  updateUser(userData: IUpdateUserData): Observable<{ message: string; data: IUser }> {
    const userId = this.getCurrentUserId();
    return this._http.put<{ message: string; data: IUser }>(
      `${this.apiURL}/${userId}`,
      userData,
      this.getHeaders()
    );
  }

  // تحديث كلمة المرور
  updatePassword(passwordData: IUpdatePasswordData): Observable<{ message: string }> {
    const userId = this.getCurrentUserId();
    return this._http.put<{ message: string }>(
      `${this.apiURL}/${userId}/password`,
      passwordData,
      this.getHeaders()
    );
  }

  // الحصول على جميع المستخدمين (للمسؤول فقط)
  getAllUsers(): Observable<IUserResponse> {
    return this._http.get<IUserResponse>(
      `${this.apiURL}/`,
      this.getHeaders()
    );
  }

  // الحصول على مستخدم بواسطة ID
  getUserById(userId: string): Observable<{ message: string; data: IUser }> {
    return this._http.get<{ message: string; data: IUser }>(
      `${this.apiURL}/${userId}`,
      this.getHeaders()
    );
  }

  // حذف مستخدم (للمسؤول فقط)
  deleteUser(userId: string): Observable<{ message: string }> {
    return this._http.delete<{ message: string }>(
      `${this.apiURL}/${userId}`,
      this.getHeaders()
    );
  }

  // دالة مساعدة للحصول على رؤوس الطلبات
  private getHeaders() {
    const token = this._auth.getToken();
    if (token) {
      return {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
      };
    }
    throw new Error('No token available');
  }

  // دالة مساعدة للحصول على ID المستخدم الحالي
  private getCurrentUserId(): string {
    const token = this._auth.getToken();
    if (token) {
      const decode = this._auth.tokenDecode(token);
      return decode?.id || '';
    }
    throw new Error('No token available');
  }
}
