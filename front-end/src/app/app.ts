import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('front-end');
   constructor(private _auth: AuthService) {
    _auth.cheackToken();
  }
  ngOnInit(): void {
    this._auth.cheackToken()
  }
}
