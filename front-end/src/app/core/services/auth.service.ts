import { Injectable } from '@angular/core';
import { environment } from '../../../environments/env';
import { ILoginData, ILoginRes, ITokenDecode } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userData = new BehaviorSubject<ITokenDecode | null>(null);
  apiURL = environment.apiURL + '/auth/login';
  constructor(private _http: HttpClient, private _router: Router) {}
  login(data: ILoginData) {
    console.log('API URL:', this.apiURL);
    console.log('Payload:', data);

    return this._http.post<ILoginRes>(this.apiURL, data).pipe(
      tap((res) => {
        console.log('res', res.data); //نوصل للداتا بدون ما نغير فيها حاجة
        //1-get token from res
        const token = res.data;
        //2-save token in localstorage
        this.setToken(token);
        //3-decode token
        const decode = this.tokenDecode(token);
        if (decode) {
          if (decode.role === 'admin') {
            //route using role
            this._router.navigate(['/dashboard']);
          } else {
            this._router.navigate(['/home']);
          }
          //4-send data to subject
          this.userData.next(decode);
        }
      })
    );
  }
  isValidToken(token:string){

    if(token){
      const decode = this.tokenDecode(token);
      if(decode){
        const exp = decode.exp * 1000;
        if(Date.now() < exp){
         return true
        }
      }
    }
    return false
  }

  isAuthanticateUser(){
    const token = this.getToken();
    console.log(token);

    if(token){
      if(this.isValidToken(token)){
        const decode = this.tokenDecode(token);
        if(decode?.role === 'user'){
 return true
        }

      }
    }
    return false;
  }

    isAuthanticateAdmin(){
    const token = this.getToken();
    if(token){
      if(this.isValidToken(token)){
        const decode = this.tokenDecode(token);
        if(decode?.role === 'admin'){
 return true
        }

      }
    }
    return false;
  }
  signup(data: any) {
    const apiURL = environment.apiURL + '/auth/signup';
    console.log('Signup API URL:', apiURL);
    console.log('Signup Payload:', data);

    return this._http.post(apiURL, data, {
      observe: 'response',
    });
  }
  cheackToken() {
    const token = this.getToken();
    if (token) {
      if (this.isValidToken(token)) {
        const decode = this.tokenDecode(token);
        this.userData.next(decode);
      } else {
        this.logOut();
      }
    }
  }

  // cheackToken() {
  //   const token = this.getToken();
  //   if (token) {
  //     const decode = this.tokenDecode(token);
  //     console.log(token);

  //     if (decode) {
  //       const exp = decode.exp * 1000;
  //       console.log(exp);

  //       if (Date.now() < exp) {
  //         this.userData.next(decode);
  //       } else {
  //         this.userData.next(null);
  //         this.logOut();
  //       }

  //     }
  //      // this.userData.next(decode);
  //   }
  // }
  logOut() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.userData.next(null);
    this._router.navigate(['/home']);
  }
  getUserData() {
    return this.userData.asObservable();
  }
  private TOKEN_KEY:string = 'token';
  private setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  public tokenDecode(token: string): ITokenDecode | null {
    try {
      const decode = jwtDecode<ITokenDecode>(token); //بتاخد jwt Payload
      console.log(decode);

      return decode;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
