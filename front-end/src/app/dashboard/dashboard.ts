// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  name = '';
  constructor(private _auth:AuthService , private _router:Router){}

  ngOnInit(): void {
    this._auth.getUserData().subscribe(data => {
      if(data){
        this.name = data.name;
      } else {
        this.name = '';
      }
    });
  }

  logout(){
    this._router.navigate(['/home']);
    this._auth.logOut();
  }
}
