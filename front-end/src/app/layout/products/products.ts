// layout/products/products.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product-service';
import { CategoryService } from '../../core/services/categories.service';
import { CartService } from '../../core/services/cart.service';
import { IProduct, ICategory, ISubCategory } from '../../core/models/product.model';
import { environment } from '../../../environments/env';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit, OnDestroy {
  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  categories: ICategory[] = [];
  subCategories: ISubCategory[] = [];

  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  totalProducts = 0;

  selectedCategory: string = '';
  selectedSubCategory: string = '';
  selectedPriceRange: string = '';
  searchQuery: string = '';
  sortBy: string = 'newest';

  isLoading = false;
  isGridView = true;
  showFilters = false;

  staticURL = environment.staticFilesURL;

  private subscriptions: Subscription[] = [];

  constructor(
    private _productService: ProductService,
    private _categoryService: CategoryService,
    private _cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadData(): void {
    this.isLoading = true;

    // Load categories first
    const categoriesSub = this._categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
        this.loadSubCategories();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loadProducts();
      }
    });

    this.subscriptions.push(categoriesSub);
  }

  loadSubCategories(): void {
    const subCategoriesSub = this._categoryService.getAllSubCategories().subscribe({
      next: (response) => {
        this.subCategories = response.data;
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
        this.loadProducts();
      }
    });

    this.subscriptions.push(subCategoriesSub);
  }

  loadProducts(): void {
    const productsSub = this._productService.getAllProducts().subscribe({
      next: (response) => {
        this.products = response.data;
        this.totalProducts = this.products.length;
        this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });

    this.subscriptions.push(productsSub);
  }


 addToCart(product: IProduct): void {
  if (product.stock === 0) {
    alert('Sorry, this product is out of stock');
    return;
  }

  const cartData = {
    name: product.name,
    quantity: 1
  };

  console.log('Adding to cart:', cartData);

  this._cartService.addToCart(cartData).subscribe({
    next: (response) => {
      console.log('Add to cart response:', response);
      this._cartService.notifyCartUpdate();
    //  alert(`"${product.name}" added to cart!`);
    },
    error: (error) => {
      console.error('Add to cart error:', error);
      //alert('Failed to add to cart: ' + error.message);
    }
  });
}

  applyFilters(): void {
    let filtered = [...this.products];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.desc.toLowerCase().includes(query)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(product => {
        if (!product.category) return false;
        if (typeof product.category === 'string') {
          return product.category === this.selectedCategory;
        }
        return product.category._id === this.selectedCategory;
      });
    }

    if (this.selectedSubCategory) {
      filtered = filtered.filter(product => {
        if (!product.subCategory) return false;
        if (typeof product.subCategory === 'string') {
          return product.subCategory === this.selectedSubCategory;
        }
        return product.subCategory._id === this.selectedSubCategory;
      });
    }

    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        if (max) {
          return product.price >= min && product.price <= max;
        }
        return product.price >= min;
      });
    }

    filtered = this.sortProducts(filtered);

    this.filteredProducts = filtered;
    this.totalProducts = filtered.length;
    this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
    this.currentPage = 1;
  }

  sortProducts(products: IProduct[]): IProduct[] {
    switch (this.sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...products].sort((a, b) => b.price - a.price);
      case 'name-asc':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...products].sort((a, b) => b.name.localeCompare(a.name));
      case 'newest':
        return [...products].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case 'oldest':
        return [...products].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
      default:
        return products;
    }
  }


  getCategoryName(category: string | ICategory | undefined): string {
    if (!category) return 'No Category';

    if (typeof category === 'string') {
      const found = this.categories.find(c => c._id === category);
      return found ? found.name : 'Unknown';
    }

    return category.name;
  }

  getSubCategoryName(subCategory: string | ISubCategory | undefined): string {
    if (!subCategory) return 'No Sub-Category';

    if (typeof subCategory === 'string') {
      const found = this.subCategories.find(sc => sc._id === subCategory);
      return found ? found.name : 'Unknown';
    }

    return subCategory.name;
  }

  getProductsByCategory(categoryId: string): number {
    return this.products.filter(product => {
      if (!product.category) return false;
      if (typeof product.category === 'string') {
        return product.category === categoryId;
      }
      return product.category._id === categoryId;
    }).length;
  }

  getProductsBySubCategory(subCategoryId: string): number {
    return this.products.filter(product => {
      if (!product.subCategory) return false;
      if (typeof product.subCategory === 'string') {
        return product.subCategory === subCategoryId;
      }
      return product.subCategory._id === subCategoryId;
    }).length;
  }

  getParentSubCategories(categoryId: string): ISubCategory[] {
    return this.subCategories.filter(subCat => {
      const parent = subCat.parent;
      if (!parent) return false;

      if (typeof parent === 'string') {
        return parent === categoryId;
      }

      return parent._id === categoryId;
    });
  }


  getPaginatedProducts(): IProduct[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  getEndIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.totalProducts);
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(this.currentPage - 1);
        pages.push(this.currentPage);
        pages.push(this.currentPage + 1);
        pages.push('...');
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }


  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.selectedSubCategory = '';
    this.applyFilters();
  }

  onSubCategoryChange(subCategoryId: string): void {
    this.selectedSubCategory = subCategoryId;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.applyFilters();
  }

  toggleView(): void {
    this.isGridView = !this.isGridView;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedSubCategory = '';
    this.selectedPriceRange = '';
    this.searchQuery = '';
    this.applyFilters();
  }
}
