import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Feedback } from '../feedback/feedback';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink,  FormsModule,Feedback],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}













