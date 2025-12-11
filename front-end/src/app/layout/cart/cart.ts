// pages/cart/cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, ICart, ICartItem } from '../../core/services/cart.service';
import { OrderService, ICreateOrderRequest } from '../../core/services/order.service';
import { environment } from '../../../environments/env';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cart: ICart | null = null;
  isLoading = false;
  errorMessage = '';
  isCheckout = false;
  checkoutData: ICreateOrderRequest = {
    address: '',
    phonenumber: ''
  };

  staticURL = environment.staticFilesURL;

  constructor(
    private _cartService: CartService,
    private _orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

loadCart(): void {
  this.isLoading = true;
  this._cartService.getCart().subscribe({
    next: (response) => {
      // تأكد من أن response.data موجود
      if (response && response.data) {
        this.cart = response.data;
        console.log('Cart loaded:', this.cart);
      } else {
        this.cart = null;
        console.log('Cart is empty');
      }
      this.isLoading = false;
    },
    error: (error) => {
     // this.errorMessage = 'Failed to load cart ' ;
      this.isLoading = false;
      this.cart = null;
      console.error('Error loading cart:', error);
    }
  });
}

  increaseQuantity(item: ICartItem): void {
    this.isLoading = true;
    this._cartService.addToCart({
      name: item.product.name,
      quantity: 1
    }).subscribe({
      next: () => {
        this.loadCart();
        this._cartService.notifyCartUpdate();
      },
      error: (error) => {
        this.errorMessage = 'Failed to update quantity: ' + error.message;
        this.isLoading = false;
        console.error('Error updating quantity:', error);
      }
    });
  }

  decreaseQuantity(item: ICartItem): void {
    if (item.quantity <= 1) {
      this.removeItem(item.product.name);
      return;
    }

    this.isLoading = true;
    this._cartService.addToCart({
      name: item.product.name,
      quantity: -1
    }).subscribe({
      next: () => {
        this.loadCart();
        this._cartService.notifyCartUpdate();
      },
      error: (error) => {
        this.errorMessage = 'Failed to update quantity: ' + error.message;
        this.isLoading = false;
        console.error('Error updating quantity:', error);
      }
    });
  }

  removeItem(productName: string): void {
    if (!confirm('Are you sure you want to remove this item from cart?')) return;

    this.isLoading = true;
    this._cartService.removeFromCart({ name: productName }).subscribe({
      next: () => {
        this.loadCart();
        this._cartService.notifyCartUpdate();
      },
      error: (error) => {
        this.errorMessage = 'Failed to remove item: ' + error.message;
        this.isLoading = false;
        console.error('Error removing item:', error);
      }
    });
  }

  clearCart(): void {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    this.isLoading = true;
    this._cartService.clearCart().subscribe({
      next: () => {
        this.cart = null;
        this.isLoading = false;
        this._cartService.notifyCartUpdate();
      },
      error: (error) => {
        this.errorMessage = 'Failed to clear cart: ' + error.message;
        this.isLoading = false;
        console.error('Error clearing cart:', error);
      }
    });
  }

  proceedToCheckout(): void {
    if (!this.cart || this.cart.items.length === 0) {
      this.errorMessage = 'Your cart is empty';
      return;
    }
    this.isCheckout = true;
  }

  completeOrder(): void {
  if (!this.checkoutData.address.trim()) {
    this.errorMessage = 'Please enter your address';
    return;
  }

  if (!this.checkoutData.phonenumber.trim()) {
    this.errorMessage = 'Please enter your phone number';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  this._orderService.createOrder(this.checkoutData).subscribe({
    next: (response) => {
      console.log('Order response:', response);
      alert('Order placed successfully!');
      this.isCheckout = false;
      this.cart = null;
      this.checkoutData = { address: '', phonenumber: '' };
      this._cartService.notifyCartUpdate();
      this.isLoading = false;

      // this.router.navigate(['/account/orders']);
    },
    error: (error) => {
      console.error('Order error details:', error);
      this.errorMessage = error.error?.message || 'Failed to place order';
      this.isLoading = false;

      if (error.error?.error && environment.production === false) {
        console.error('Detailed error:', error.error.error);
      }
    }
  });
}

  cancelCheckout(): void {
    this.isCheckout = false;
    this.checkoutData = { address: '', phonenumber: '' };
  }

  getImageUrl(imgURL: string | undefined): string {
    if (!imgURL) {
      return 'https://via.placeholder.com/150x150?text=No+Image';
    }

    if (imgURL.startsWith('http')) {
      return imgURL;
    }

    return this.staticURL + '/' + imgURL;
  }

  getTotalItemsCount(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((total, item) => total + item.quantity, 0);
  }

onImageError(event: Event): void {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = 'https://via.placeholder.com/150x150?text=No+Image';
  imgElement.onerror = null;
}

formatDate(date: Date | string): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
}
