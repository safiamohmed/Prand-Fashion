// core/services/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/env';

export interface ICartItem {
  _id?: string;
  product: {
    _id: string;
    name: string;
    price: number;
    imgURL?: string;  
    stock: number;
  };
  quantity: number;
  price: number;
  total: number;
}

export interface ICart {
  _id: string;
  user: string;
  items: ICartItem[];
  cartTotal: number;
  itemsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartResponse {
  message: string;
  data: ICart;
}

export interface IAddToCartRequest {
  name: string;
  quantity: number;
}

export interface IRemoveFromCartRequest {
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiURL = environment.apiURL + '/cart';
  private cartUpdated = new Subject<void>();
  private cartData = new BehaviorSubject<ICart | null>(null);

  cartUpdated$ = this.cartUpdated.asObservable();
  cartData$ = this.cartData.asObservable();

  constructor(private _http: HttpClient) {

    this.loadCartOnInit();
  }

  private loadCartOnInit(): void {
    this.getCart().subscribe({
      next: (response) => {
        this.cartData.next(response.data);
      },
      error: (error) => {
        console.error('Error loading initial cart:', error);
        this.cartData.next(null);
      }
    });
  }

  getCart(): Observable<ICartResponse> {
    return this._http.get<ICartResponse>(this.apiURL).pipe(
      tap(response => {
        this.cartData.next(response.data);
        this.cartUpdated.next();
      })
    );
  }

  addToCart(productData: IAddToCartRequest): Observable<ICartResponse> {
    return this._http.post<ICartResponse>(this.apiURL, productData).pipe(
      tap(response => {
        this.cartData.next(response.data);
        this.cartUpdated.next();
      })
    );
  }

  removeFromCart(productData: IRemoveFromCartRequest): Observable<ICartResponse> {
    return this._http.post<ICartResponse>(`${this.apiURL}/remove`, productData).pipe(
      tap(response => {
        this.cartData.next(response.data);
        this.cartUpdated.next();
      })
    );
  }

  clearCart(): Observable<any> {
    return this._http.delete(`${this.apiURL}/clear`).pipe(
      tap(() => {
        this.cartData.next(null);
        this.cartUpdated.next();
      })
    );
  }

  notifyCartUpdate(): void {
    this.cartUpdated.next();
  }

  getCurrentCart(): ICart | null {
    return this.cartData.value;
  }

  getCartItemsCount(): number {
    const cart = this.cartData.value;
    if (!cart || !cart.items) return 0;

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }
}
