import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';

export interface ITestimonial {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITestimonialResponse {
  success: boolean;
  message?: string;
  count?: number;
  data: ITestimonial[];
}

export interface IAddTestimonialRequest {
  rating: number;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private apiURL = environment.apiURL + '/testimonial';

  constructor(private _http: HttpClient) {}

  getTestimonials(): Observable<ITestimonialResponse> {
    return this._http.get<ITestimonialResponse>(this.apiURL);
  }

  addTestimonial(data: IAddTestimonialRequest): Observable<any> {
    return this._http.post(this.apiURL, data);
  }

  deactivateTestimonial(id: string): Observable<any> {
    return this._http.patch(`${this.apiURL}/${id}/deactivate`, {});
  }

  getStars(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push('★');
      } else {
        stars.push('☆');
      }
    }
    return stars;
  }

  // تحويل التاريخ
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
