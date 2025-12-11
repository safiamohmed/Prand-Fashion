import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, ICart } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './chechout.html',
  styleUrl: './chechout.css',
})
export class Checkout implements OnInit {
  cart: ICart | null = null;
  isLoading = false;

  // بيانات المستخدم
  address: string = '';
  phoneNumber: string = '';

  // رسائل
  errorMessage = '';
  successMessage = '';

  constructor(
    private _cartService: CartService,
    private _orderService: OrderService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this._cartService.getCart().subscribe({
      next: (response) => {
        this.cart = response.data;
        this.isLoading = false;

        if (!this.cart || this.cart.items.length === 0) {
          this._router.navigate(['/cart']);
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load cart';
        this.isLoading = false;
      }
    });
  }

  placeOrder(): void {
    // التحقق من البيانات
    if (!this.address.trim()) {
      this.errorMessage = 'Please enter your address';
      return;
    }

    if (!this.phoneNumber.trim()) {
      this.errorMessage = 'Please enter your phone number';
      return;
    }

    if (!this.isValidPhoneNumber(this.phoneNumber)) {
      this.errorMessage = 'Please enter a valid phone number';
      return;
    }

    this.isLoading = true;

    this._orderService.createOrder({
      address: this.address,
      phonenumber: this.phoneNumber
    }).subscribe({
      next: (response) => {
        this.successMessage = 'Order placed successfully!';
        this.isLoading = false;

        // إعادة التوجيه بعد 2 ثانية
        setTimeout(() => {
          this._router.navigate(['/account/orders']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to place order';
        this.isLoading = false;
        console.error('Error placing order:', error);
      }
    });
  }

  isValidPhoneNumber(phone: string): boolean {
    // تحقق بسيط لرقم الهاتف
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  getSubtotal(): number {
    if (!this.cart) return 0;
    return this.cart.cartTotal;
  }

  getShipping(): number {
    return 10.00;
  }

  getTax(): number {
    return this.getSubtotal() * 0.08;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }
}
