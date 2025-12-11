import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService, IOrder, IOrderProduct, IOrderStats } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-orders',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-orders.html',
  styleUrl: './user-orders.css',
})
export class UserOrders implements OnInit, OnDestroy {
  orders: IOrder[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  stats: IOrderStats | null = null;

  editingOrder: IOrder | null = null;
  editData: any = {};

  currentUserId: string = '';
  private userSubscription: Subscription | null = null;

  constructor(
    private _orderService: OrderService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUserOrders();
    this.loadOrderStats();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadCurrentUser(): void {
    this.userSubscription = this._authService.getUserData().subscribe({
      next: (userData) => {
        if (userData) {
          this.currentUserId = userData.id;
        } else {
          this.currentUserId = '';
          // this._router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Error getting user data:', error);
        this.currentUserId = '';
      }
    });
  }

  startEdit(order: IOrder): void {
    if (!this._orderService.canUserModify(order, this.currentUserId)) {
      alert('You cannot modify this order. Only pending orders can be modified.');
      return;
    }

    this.editingOrder = order;
    this.editData = {
      address: order.address,
      phonenumber: order.phonenumber
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveEdit(): void {
    if (!this.editingOrder) return;

    this.isLoading = true;
    this._orderService.updateUserOrder(this.editingOrder._id, this.editData).subscribe({
      next: (response) => {
        const index = this.orders.findIndex(o => o._id === this.editingOrder!._id);
        if (index !== -1) {
          this.orders[index] = response.data;
        }

        this.cancelEdit();
        this.successMessage = 'Order updated successfully';
        this.isLoading = false;

        this.loadOrderStats();

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update order';
        this.isLoading = false;
      },
    });
  }

  cancelEdit(): void {
    this.editingOrder = null;
    this.editData = {};
    this.errorMessage = '';
  }

  cancelOrder(order: IOrder): void {
    if (!this._orderService.canUserCancel(order, this.currentUserId)) {
      alert('You cannot cancel this order. Only pending orders can be canceled.');
      return;
    }

    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.isLoading = true;
    this._orderService.cancelUserOrder(order._id).subscribe({
      next: (response) => {
        const index = this.orders.findIndex(o => o._id === order._id);
        if (index !== -1) {
          this.orders[index] = response.data;
        }

        this.successMessage = 'Order canceled successfully';
        this.isLoading = false;

        this.loadOrderStats();

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to cancel order';
        this.isLoading = false;
      },
    });
  }

  loadUserOrders(): void {
    this.isLoading = true;
    this._orderService.getUserOrders().subscribe({
      next: (response) => {
        this.orders = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load orders';
        this.isLoading = false;
        console.error('Error loading orders:', error);
      },
    });
  }

  loadOrderStats(): void {
    this._orderService.getUserOrderStats().subscribe({
      next: (response) => {
        this.stats = response.data;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  getStatusColor(status: string): string {
    return this._orderService.getStatusColor(status);
  }

  getStatusText(status: string): string {
    return this._orderService.getStatusText(status);
  }

  getProductName(order: IOrder): string {
    if (typeof order.product === 'object' && order.product !== null) {
      return (order.product as IOrderProduct).name;
    }
    return 'Product ID: ' + order.product;
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canModify(order: IOrder): boolean {
    return this._orderService.canUserModify(order, this.currentUserId);
  }

  canCancel(order: IOrder): boolean {
    return this._orderService.canUserCancel(order, this.currentUserId);
  }

  getTotalSpent(): number {
    return this.orders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + order.totalPrice, 0);
  }

  getOrdersByStatus(status: string): number {
    return this.orders.filter(order => order.status === status).length;
  }
}
