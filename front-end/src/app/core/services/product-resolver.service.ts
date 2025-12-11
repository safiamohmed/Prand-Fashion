// core/services/product-resolver.service.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { IProductResponse } from '../models/product.model';
import { catchError, of } from 'rxjs';
import { ProductService } from './product-service';

@Injectable({
  providedIn: 'root',
})
export class ProductResolverService implements Resolve<IProductResponse | null> {
  constructor(
    private _router: Router,
    private _productService: ProductService
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const slug = route.paramMap.get('slug');
    if (!slug) {
      this._router.navigate(['/products']);
      return of(null);
    }

    return this._productService.getProductBySlug(slug).pipe(
      catchError(err => {
        this._router.navigate(['/products']);
        return of(null);
      })
    );
  }
}
