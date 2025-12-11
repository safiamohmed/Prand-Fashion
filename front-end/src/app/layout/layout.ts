// layout/layout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, FormsModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit, OnDestroy {
  name: string = '';
  userRole: string = '';
  cartCount: number = 0;
  showSearch: boolean = false;
  searchQuery: string = '';
  isMenuOpen: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private _authService: AuthService,
    private _cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadCartCount();

    // استمع للتحديثات
    this.subscriptions.push(
      this._cartService.cartUpdated$.subscribe(() => {
        this.loadCartCount();
      })
    );
  }

  ngOnDestroy(): void { 
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUserData(): void {
    const userDataSub = this._authService.getUserData().subscribe({
      next: (userData) => {
        if (userData) {
          this.name = userData.name || '';
          this.userRole = userData.role || '';
        } else {
          this.name = '';
          this.userRole = '';
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.name = '';
        this.userRole = '';
      }
    });

    this.subscriptions.push(userDataSub);
  }

  loadCartCount(): void {
    this._cartService.getCart().subscribe({
      next: (response) => {
        const cart = response.data;
        if (cart && cart.items) {
          // حساب العدد الكلي للعناصر
          const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

          // تحديث العداد دائمًا بغض النظر عن العدد
          this.cartCount = totalItems;
        } else {
          this.cartCount = 0;
        }
      },
      error: (error) => {
        console.error('Error loading cart count:', error);
        this.cartCount = 0;
      }
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (this.showSearch) {
      setTimeout(() => {
        const input = document.querySelector('.search-input') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  }

  closeSearch(): void {
    this.showSearch = false;
    this.searchQuery = '';
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(this.searchQuery.trim())}`;
      this.closeSearch();
    }
  }

  logOut(): void {
    this._authService.logOut();
  }
}
