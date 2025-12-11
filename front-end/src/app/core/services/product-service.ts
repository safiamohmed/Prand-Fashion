// services/product.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/env';
import { Observable } from 'rxjs';
import { IProductResponse, IProductsResponse, IProduct } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private _http: HttpClient) {}

  apiURL = environment.apiURL + '/product';

  getAllProducts(): Observable<IProductsResponse> {
    return this._http.get<IProductsResponse>(this.apiURL);
  }

  getProductBySlug(slug: string): Observable<IProductResponse> {
    return this._http.get<IProductResponse>(`${this.apiURL}/${slug}`);
  }


  getRelatedProducts(slug: string): Observable<IProductsResponse> {
    return this._http.get<IProductsResponse>(`${this.apiURL}/related/${slug}`);
  }

  createProduct(productData: FormData): Observable<IProductResponse> {
    return this._http.post<IProductResponse>(this.apiURL, productData);
  }

  updateProduct(id: string, productData: FormData): Observable<IProductResponse> {
    return this._http.put<IProductResponse>(`${this.apiURL}/${id}`, productData);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this._http.delete<{ message: string }>(`${this.apiURL}/${id}`);
  }
  getProductById(id: string): Observable<IProductResponse> {
  return this._http.get<IProductResponse>(`${this.apiURL}/id/${id}`);
}
}
