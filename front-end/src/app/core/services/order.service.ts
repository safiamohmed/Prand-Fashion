// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/env';

// export interface IOrderProduct {
//   _id: string;
//   name: string;
//   price: number;
//   imgURL?: string;
// }

// export interface IOrderUser {
//   _id: string;
//   name: string;
//   email: string;
// }

// export interface IOrder {
//   _id: string;
//   user: IOrderUser | string;
//   product: IOrderProduct | string;
//   quantity: number;
//   price: number;
//   totalPrice: number;
//   address: string;
//   phonenumber: string;
//   status: 'pending' | 'shipped' | 'delivered' | 'canceled' | 'rejected';
//   purchaseAt: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface IOrderResponse {
//   message: string;
//   data: IOrder[];
// }

// export interface IOrderResponse {
//   message: string;
//   data: IOrder[];
// }

// export interface ICreateOrderRequest {
//   address: string;
//   phonenumber: string;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class OrderService {
//   private apiURL = environment.apiURL + '/order';

//   constructor(private _http: HttpClient) {}

//   createOrder(orderData: ICreateOrderRequest): Observable<any> {
//     return this._http.post(`${this.apiURL}`, orderData);
//   }

//   getUserOrders(): Observable<IOrderResponse> {
//     return this._http.get<IOrderResponse>(this.apiURL);
//   }

//   getAllOrders(): Observable<IOrderResponse> {
//     return this._http.get<IOrderResponse>(`${this.apiURL}/all`);
//   }

//   updateOrderStatus(orderId: string, status: string): Observable<any> {
//     return this._http.put(`${this.apiURL}/${orderId}/status`, { status });
//   }
// }




import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';

export interface IOrderProduct {
  _id: string;
  name: string;
  price: number;
  imgURL?: string;
  stock: number;
}

export interface IOrderUser {
  _id: string;
  name: string;
  email: string;
}

export interface ILastUpdatedBy {
  user: IOrderUser | string;
  timestamp: Date;
  action: string;
}

export interface IOrder {
  _id: string;
  user: IOrderUser | string;
  product: IOrderProduct | string;
  quantity: number;
  price: number;
  totalPrice: number;
  address: string;
  phonenumber: string;
  status: 'pending' | 'shipped' | 'delivered' | 'canceled' | 'rejected';
  purchaseAt: Date;
  lastUpdatedBy: ILastUpdatedBy;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderResponse {
  message: string;
  data: IOrder[];
}

export interface ISingleOrderResponse {
  message: string;
  data: IOrder;
}

export interface ICreateOrderRequest {
  address: string;
  phonenumber: string;
}

export interface IUpdateOrderRequest {
  address?: string;
  phonenumber?: string;
}

export interface IOrderStats {
  stats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  totalOrders: number;
  pendingOrders: number;
  canCancel: boolean;
}

export interface IOrderStatsResponse {
  message: string;
  data: IOrderStats;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiURL = environment.apiURL + '/order';

  constructor(private _http: HttpClient) {}

  createOrder(orderData: ICreateOrderRequest): Observable<ISingleOrderResponse> {
    return this._http.post<ISingleOrderResponse>(this.apiURL, orderData);
  }

  getUserOrders(): Observable<IOrderResponse> {
    return this._http.get<IOrderResponse>(this.apiURL);
  }

  getAllOrders(): Observable<IOrderResponse> {
    return this._http.get<IOrderResponse>(`${this.apiURL}/all`);
  }

  updateOrderStatus(orderId: string, status: string): Observable<ISingleOrderResponse> {
    return this._http.put<ISingleOrderResponse>(
      `${this.apiURL}/${orderId}/status`,
      { status }
    );
  }

  // دالة جديدة: تحديث بيانات الطلب
  updateUserOrder(orderId: string, data: IUpdateOrderRequest): Observable<ISingleOrderResponse> {
    return this._http.put<ISingleOrderResponse>(
      `${this.apiURL}/${orderId}`,
      data
    );
  }

  // دالة جديدة: إلغاء الطلب
  cancelUserOrder(orderId: string): Observable<ISingleOrderResponse> {
    return this._http.put<ISingleOrderResponse>(
      `${this.apiURL}/${orderId}/cancel`,
      {}
    );
  }

  // دالة جديدة: الحصول على تفاصيل طلب معين
  getOrderDetails(orderId: string): Observable<ISingleOrderResponse> {
    return this._http.get<ISingleOrderResponse>(`${this.apiURL}/${orderId}`);
  }

  // دالة جديدة: الحصول على إحصائيات الطلبات
  getUserOrderStats(): Observable<IOrderStatsResponse> {
    return this._http.get<IOrderStatsResponse>(`${this.apiURL}/stats`);
  }

  // تحديث: يمكن التعديل فقط إذا كانت الحالة pending
  canUserModify(order: IOrder, userId: string): boolean {
    if (typeof order.user === 'object') {
      const user = order.user as IOrderUser;
      if (user._id !== userId) return false;
    } else {
      if (order.user !== userId) return false;
    }

    // فقط pending يمكن تعديلها
    return order.status === 'pending';
  }

  // تحديث: يمكن الإلغاء فقط إذا كانت الحالة pending
  canUserCancel(order: IOrder, userId: string): boolean {
    if (typeof order.user === 'object') {
      const user = order.user as IOrderUser;
      if (user._id !== userId) return false;
    } else {
      if (order.user !== userId) return false;
    }

    // فقط pending يمكن إلغاؤها
    return order.status === 'pending';
  }

  // دالة مساعدة للحصول على نص الحالة
  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'canceled': return 'Canceled';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  }

  // دالة مساعدة للحصول على لون الحالة
  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'canceled': return 'status-canceled';
      case 'rejected': return 'status-rejected';
      default: return 'status-default';
    }
  }
}
