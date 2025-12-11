// layout/product-details/product-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product-service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/categories.service';
import { IProduct, ICategory, ISubCategory } from '../../core/models/product.model';
import { environment } from '../../../environments/env';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {
  product!: IProduct;
  relatedProducts: IProduct[] = [];
  categories: ICategory[] = [];
  subCategories: ISubCategory[] = [];
  quantity = 1;
  selectedImageIndex = 0;
  images: string[] = [];
  isLoading = true;

  staticURL = environment.staticFilesURL;

  constructor(
    private _productService: ProductService,
    private _cartService: CartService,
    private _categoryService: CategoryService,
    private _activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    // جلب الكاتيجوريات والكاتيجوريات الفرعية أولاً
    this._categoryService.getAllCategories().subscribe({
      next: (categoriesResponse) => {
        this.categories = categoriesResponse.data;

        this._categoryService.getAllSubCategories().subscribe({
          next: (subCategoriesResponse) => {
            this.subCategories = subCategoriesResponse.data;
            this.loadProduct();
          },
          error: (error) => {
            console.error('Error loading subcategories:', error);
            this.loadProduct();
          },
        });
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loadProduct();
      },
    });
  }

  loadProduct(): void {
    const resolvedData = this._activeRoute.snapshot.data['product'];
    if (resolvedData && resolvedData.data) {
      this.product = resolvedData.data;
      this.loadImages();
      this.loadRelatedProducts();
      this.isLoading = false;
    } else {
      // إذا لم تكن البيانات متوفرة في resolver، جلبها مباشرة
      const slug = this._activeRoute.snapshot.paramMap.get('slug');
      if (slug) {
        this._productService.getProductBySlug(slug).subscribe({
          next: (response) => {
            this.product = response.data;
            this.loadImages();
            this.loadRelatedProducts();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading product:', error);
            this.isLoading = false;
          },
        });
      }
    }
  }

  loadImages(): void {
    if (this.product.imgURL) {
      this.images = [this.product.imgURL];
    }
  }

  loadRelatedProducts(): void {
    this._productService.getRelatedProducts(this.product.slug).subscribe({
      next: (response) => {
        this.relatedProducts = response.data.slice(0, 4);
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      },
    });
  }

  increaseQuantity(): void {
    if (this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onQuantityChange(): void {
    if (this.quantity < 1) {
      this.quantity = 1;
    }
    if (this.quantity > this.product.stock) {
      this.quantity = this.product.stock;
    }
  }

  addToCart(product?: IProduct): void {
    const targetProduct = product || this.product;
    const quantity = product ? 1 : this.quantity;

    if (targetProduct.stock === 0) {
      alert('Sorry, this product is out of stock');
      return;
    }

    const cartData = {
      name: targetProduct.name,
      quantity: quantity,
    };

    this._cartService.addToCart(cartData).subscribe({
      next: () => {
        this._cartService.notifyCartUpdate();
        alert(`${quantity} x "${targetProduct.name}" added to cart!`);
      },
      // error: (error) => {
      //   // alert('Failed to add to cart: ' + error.message);
      // },
    });
  }

  buyNow(): void {
    this.addToCart();
    //  this._router.navigate(['/cart']);
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  getStockStatus(): string {
    if (this.product.stock <= 0) return 'Out of Stock';
    if (this.product.stock < 10) return 'Low Stock';
    return 'In Stock';
  }

  getStockClass(): string {
    if (this.product.stock <= 0) return 'out-of-stock';
    if (this.product.stock < 10) return 'low-stock';
    return 'in-stock';
  }

  // دالة مساعدة للحصول على اسم الكاتيجوري
  getCategoryName(category: string | ICategory | undefined): string {
    if (!category) return 'No Category';

    if (typeof category === 'string') {
      const foundCategory = this.categories.find((c) => c._id === category);
      return foundCategory ? foundCategory.name : 'Unknown Category';
    }

    return category.name || 'No Category';
  }

  // دالة مساعدة للحصول على اسم الكاتيجوري الفرعية
  getSubCategoryName(subCategory: string | ISubCategory | undefined): string {
    if (!subCategory) return 'No Sub-Category';

    if (typeof subCategory === 'string') {
      const foundSubCategory = this.subCategories.find((sc) => sc._id === subCategory);
      return foundSubCategory ? foundSubCategory.name : 'Unknown Sub-Category';
    }

    return subCategory.name || 'No Sub-Category';
  }

  // دالة للتعامل مع أخطاء تحميل الصور
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://via.placeholder.com/400x400?text=No+Image';
    imgElement.onerror = null; // منع تكرار الأخطاء
  }
}
