import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, IOrder, IOrderProduct, IOrderUser } from '../../core/services/order.service';

@Component({
  selector: 'app-order',
  imports: [CommonModule, FormsModule],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit {
  orders: IOrder[] = [];
  isLoading = false;
  errorMessage = '';

  // حالة الفلترة
  statusFilter: string = 'all';
  searchQuery: string = '';

  // إحصائيات
  pendingCount = 0;

  constructor(private _orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this._orderService.getAllOrders().subscribe({
      next: (response) => {
        this.orders = response.data;
        this.updateStatistics();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load orders';
        this.isLoading = false;
        console.error('Error loading orders:', error);
      },
    });
  }

  updateStatistics(): void {
    this.pendingCount = this.orders.filter((o) => o.status === 'pending').length;
  }

  // دالة جديدة للتعامل مع تغيير الحالة
  onStatusChange(orderId: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;

    if (newStatus && confirm('Are you sure you want to update the order status?')) {
      this.updateOrderStatus(orderId, newStatus);
    }
  }

  updateOrderStatus(orderId: string, status: string): void {
    this._orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (error) => {
        alert('Failed to update order status');
        console.error('Error updating order:', error);
      },
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'canceled':
        return 'status-canceled';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-default';
    }
  }

  getFilteredOrders(): IOrder[] {
    let filtered = this.orders;

    // فلترة حسب الحالة
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === this.statusFilter);
    }

    // فلترة حسب البحث
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((order) => {
        // التحقق من address
        if (order.address.toLowerCase().includes(query)) return true;

        // التحقق من phone
        if (order.phonenumber.includes(query)) return true;

        // التحقق من اسم المنتج إذا كان populated
        const product = order.product as IOrderProduct;
        if (product && typeof product === 'object' && 'name' in product) {
          if (product.name.toLowerCase().includes(query)) return true;
        }

        // التحقق من اسم المستخدم إذا كان populated
        const user = order.user as IOrderUser;
        if (user && typeof user === 'object' && 'name' in user) {
          if (user.name.toLowerCase().includes(query)) return true;
        }

        return false;
      });
    }

    return filtered;
  }

  getTotalRevenue(): number {
    return this.orders
      .filter((order) => order.status === 'delivered')
      .reduce((total, order) => total + order.totalPrice, 0);
  }

  getProductName(order: IOrder): string {
    if (typeof order.product === 'object' && order.product !== null) {
      return (order.product as IOrderProduct).name;
    }
    return 'Product ID: ' + order.product;
  }

  getUserName(order: IOrder): string {
    if (typeof order.user === 'object' && order.user !== null) {
      const user = order.user as IOrderUser;
      return user.name || user.email || 'Unknown User';
    }
    return 'User ID: ' + order.user;
  }
}
