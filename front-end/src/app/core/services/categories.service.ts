// core/services/category.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubCategory {
  _id: string;
  name: string;
  slug: string;
  parent?: string | ICategory;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategoriesResponse {
  message: string;
  data: ICategory[];
}

export interface ISubCategoriesResponse {
  message: string;
  data: ISubCategory[];
}

export interface ICategoryResponse {
  message: string;
  data: ICategory;
}

export interface ISubCategoryResponse {
  message: string;
  data: ISubCategory;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiURL = environment.apiURL + '/category';
  private subCategoryURL = environment.apiURL + '/subCategory';

  constructor(private _http: HttpClient) {}

  // Categories Methods
  getAllCategories(): Observable<ICategoriesResponse> {
    return this._http.get<ICategoriesResponse>(this.apiURL);
  }

  createCategory(categoryData: { name: string; slug: string }): Observable<ICategoryResponse> {
    return this._http.post<ICategoryResponse>(this.apiURL, categoryData);
  }

  getCategoryBySlug(slug: string): Observable<ICategoryResponse> {
    return this._http.get<ICategoryResponse>(`${this.apiURL}/${slug}`);
  }

  updateCategory(id: string, categoryData: Partial<ICategory>): Observable<ICategoryResponse> {
    return this._http.put<ICategoryResponse>(`${this.apiURL}/${id}`, categoryData);
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this._http.delete<{ message: string }>(`${this.apiURL}/${id}`);
  }

  // SubCategories Methods
  getAllSubCategories(): Observable<ISubCategoriesResponse> {
    return this._http.get<ISubCategoriesResponse>(this.subCategoryURL);
  }

  createSubCategory(subCategoryData: {
    name: string;
    slug: string;
    parent?: string;
  }): Observable<ISubCategoryResponse> {
    return this._http.post<ISubCategoryResponse>(this.subCategoryURL, subCategoryData);
  }

  getSubCategoryBySlug(slug: string): Observable<ISubCategoryResponse> {
    return this._http.get<ISubCategoryResponse>(`${this.subCategoryURL}/${slug}`);
  }

  updateSubCategory(
    id: string,
    subCategoryData: Partial<ISubCategory>
  ): Observable<ISubCategoryResponse> {
    return this._http.put<ISubCategoryResponse>(`${this.subCategoryURL}/${id}`, subCategoryData);
  }

  deleteSubCategory(id: string): Observable<{ message: string }> {
    return this._http.delete<{ message: string }>(`${this.subCategoryURL}/${id}`);
  }
}
