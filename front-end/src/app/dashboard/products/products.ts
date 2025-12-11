// dashboard/products/products.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product-service';
import { CategoryService } from '../../core/services/categories.service';
import { IProduct, ICategory, ISubCategory } from '../../core/models/product.model';
import { environment } from '../../../environments/env';

@Component({
  selector: 'app-dashboard-products',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  products: IProduct[] = [];
  categories: ICategory[] = [];
  subCategories: ISubCategory[] = [];
  filteredSubCategories: ISubCategory[] = [];
currentProduct: IProduct | null = null;
isEditMode = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  showProductForm = false;
  selectedFile: File | null = null;
  selectedCategoryId: string = '';

  productForm: FormGroup;
  staticURL = environment.staticFilesURL;

  constructor(
    private _productService: ProductService,
    private _categoryService: CategoryService,
    private _fb: FormBuilder
  ) {
    this.productForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      desc: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9]+(?:-[a-z0-9]+)*$')]],
      category: ['', Validators.required],
      subCategory: ['']
    });
  }

ngOnInit(): void {
  this.loadData();
}

loadData(): void {
  this.isLoading = true;

  this.loadCategories();
}

loadCategories(): void {
  this._categoryService.getAllCategories().subscribe({
    next: (response) => {
      this.categories = response.data;
      this.loadSubCategories();
    },
    error: (error) => {
      console.error('Error loading categories:', error);
      this.loadProducts();
    }
  });
}

loadSubCategories(): void {
  this._categoryService.getAllSubCategories().subscribe({
    next: (response) => {
      this.subCategories = response.data;
      this.loadProducts();
    },
    error: (error) => {
      console.error('Error loading subcategories:', error);
      this.loadProducts();
    }
  });
}

loadProducts(): void {
  this.isLoading = true;
  this._productService.getAllProducts().subscribe({
    next: (response) => {
      this.products = response.data;
      this.isLoading = false;
    },
    error: (error) => {
      this.errorMessage = 'Failed to load products';
      this.isLoading = false;
      console.error('Error loading products:', error);
    }
  });
}

onCategoryChange(categoryId: string): void {
  this.selectedCategoryId = categoryId;
  this.productForm.patchValue({ subCategory: '' });

  this.filteredSubCategories = this.subCategories.filter(subCat => {
    const parent = subCat.parent;

    if (!parent) return false;

    if (typeof parent === 'string') {
      return parent === categoryId;
    }

    if (parent && typeof parent === 'object') {
      return parent._id === categoryId;
    }

    return false;
  });

  console.log('Filtered subcategories:', this.filteredSubCategories);
}

  // toggleProductForm(): void {
  //   this.showProductForm = !this.showProductForm;
  //   if (this.showProductForm) {
  //     this.productForm.reset();
  //     this.selectedFile = null;
  //   }
  // }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        this.errorMessage = 'File size must be less than 2MB';
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        this.errorMessage = 'Only JPEG, PNG, and JPG images are allowed';
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  // submitProduct(): void {
  //   if (this.productForm.invalid) {
  //     this.productForm.markAllAsTouched();
  //     return;
  //   }

  //   if (!this.selectedFile) {
  //     this.errorMessage = 'Please select an image';
  //     return;
  //   }

  //   this.isLoading = true;

  //   const formData = new FormData();
  //   formData.append('name', this.productForm.get('name')?.value);
  //   formData.append('desc', this.productForm.get('desc')?.value);
  //   formData.append('price', this.productForm.get('price')?.value);
  //   formData.append('stock', this.productForm.get('stock')?.value);
  //   formData.append('slug', this.productForm.get('slug')?.value);
  //   formData.append('category', this.productForm.get('category')?.value);

  //   const subCategory = this.productForm.get('subCategory')?.value;
  //   if (subCategory) {
  //     formData.append('subCategory', subCategory);
  //   }

  //   formData.append('img', this.selectedFile);

  //   this._productService.createProduct(formData).subscribe({
  //     next: (response) => {
  //       this.successMessage = 'Product created successfully!';
  //       this.products.unshift(response.data);
  //       this.toggleProductForm();
  //       this.isLoading = false;
  //       setTimeout(() => this.successMessage = '', 3000);
  //     },
  //     error: (error) => {
  //       this.errorMessage = 'Failed to create product';
  //       this.isLoading = false;
  //       console.error('Error creating product:', error);
  //     }
  //   });
  // }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.isLoading = true;
      this._productService.deleteProduct(productId).subscribe({
        next: () => {
          this.successMessage = 'Product deleted successfully!';
          this.products = this.products.filter(p => p._id !== productId);
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete product';
          this.isLoading = false;
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  getCategoryName(category: string | ICategory | undefined): string {
    if (!category) return 'No Category';

    if (typeof category === 'string') {
      const found = this.categories.find(c => c._id === category);
      return found ? found.name : 'Unknown';
    } else {
      return category.name;
    }
  }

  getSubCategoryName(subCategory: string | ISubCategory | undefined): string {
    if (!subCategory) return 'No Sub-Category';

    if (typeof subCategory === 'string') {
      const found = this.subCategories.find(sc => sc._id === subCategory);
      return found ? found.name : 'Unknown';
    } else {
      return subCategory.name;
    }
  }
  loadProductForEdit(productId: string): void {
  this.isLoading = true;
  this._productService.getProductById(productId).subscribe({
    next: (response) => {
      this.currentProduct = response.data;
      this.fillFormWithProductData();
      this.isLoading = false;
    },
    error: (error) => {
      this.errorMessage = 'Failed to load product for editing';
      this.isLoading = false;
      console.error('Error loading product:', error);
    }
  });
}

fillFormWithProductData(): void {
  if (!this.currentProduct) return;

  this.productForm.patchValue({
    name: this.currentProduct.name,
    desc: this.currentProduct.desc,
    price: this.currentProduct.price,
    stock: this.currentProduct.stock,
    slug: this.currentProduct.slug,
    category: typeof this.currentProduct.category === 'object'
      ? this.currentProduct.category?._id
      : this.currentProduct.category,
    subCategory: typeof this.currentProduct.subCategory === 'object'
      ? this.currentProduct.subCategory?._id
      : this.currentProduct.subCategory
  });

  const categoryId = typeof this.currentProduct.category === 'object'
    ? this.currentProduct.category?._id
    : this.currentProduct.category;

  if (categoryId) {
    this.onCategoryChange(categoryId);
  }
}

startEdit(product: IProduct): void {
  this.isEditMode = true;
  this.currentProduct = product;
  this.fillFormWithProductData();
  this.showProductForm = true;
}

updateProduct(): void {
  if (this.productForm.invalid) {
    this.productForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;

  const formData = new FormData();
  formData.append('name', this.productForm.get('name')?.value);
  formData.append('desc', this.productForm.get('desc')?.value);
  formData.append('price', this.productForm.get('price')?.value);
  formData.append('stock', this.productForm.get('stock')?.value);
  formData.append('slug', this.productForm.get('slug')?.value);
  formData.append('category', this.productForm.get('category')?.value);

  const subCategory = this.productForm.get('subCategory')?.value;
  if (subCategory) {
    formData.append('subCategory', subCategory);
  }

  if (this.selectedFile) {
    formData.append('img', this.selectedFile);
  }

  if (!this.currentProduct?._id) return;

  this._productService.updateProduct(this.currentProduct._id, formData).subscribe({
    next: (response) => {
      this.successMessage = 'Product updated successfully!';

      const index = this.products.findIndex(p => p._id === this.currentProduct!._id);
      if (index !== -1) {
        this.products[index] = response.data;
      }

      this.resetForm();
      this.isLoading = false;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      this.errorMessage = 'Failed to update product';
      this.isLoading = false;
      console.error('Error updating product:', error);
    }
  });
}

resetForm(): void {
  this.showProductForm = false;
  this.isEditMode = false;
  this.currentProduct = null;
  this.selectedFile = null;
  this.productForm.reset();
  this.selectedCategoryId = '';
  this.filteredSubCategories = [];
}

submitProduct(): void {
  if (this.isEditMode) {
    this.updateProduct();
  } else {
    this.createProduct();
  }
}

createProduct(): void {
  if (this.productForm.invalid) {
    this.productForm.markAllAsTouched();
    return;
  }

  if (!this.selectedFile) {
    this.errorMessage = 'Please select an image';
    return;
  }

  this.isLoading = true;

  const formData = new FormData();
  formData.append('name', this.productForm.get('name')?.value);
  formData.append('desc', this.productForm.get('desc')?.value);
  formData.append('price', this.productForm.get('price')?.value);
  formData.append('stock', this.productForm.get('stock')?.value);
  formData.append('slug', this.productForm.get('slug')?.value);
  formData.append('category', this.productForm.get('category')?.value);

  const subCategory = this.productForm.get('subCategory')?.value;
  if (subCategory) {
    formData.append('subCategory', subCategory);
  }

  formData.append('img', this.selectedFile);

  this._productService.createProduct(formData).subscribe({
    next: (response) => {
      this.successMessage = 'Product created successfully!';
      this.products.unshift(response.data);
      this.resetForm();
      this.isLoading = false;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      this.errorMessage = 'Failed to create product';
      this.isLoading = false;
      console.error('Error creating product:', error);
    }
  });
}

toggleProductForm(product?: IProduct): void {
  if (product) {
    this.startEdit(product);
  } else {
    this.resetForm();
    this.showProductForm = true;
  }
  }


getFormTitle(): string {
  return this.isEditMode ? 'Edit Product' : 'Add New Product';
}

getSubmitButtonText(): string {
  if (this.isLoading) {
    return this.isEditMode ? 'Updating...' : 'Creating...';
  }
  return this.isEditMode ? 'Update Product' : 'Create Product';
}
}
