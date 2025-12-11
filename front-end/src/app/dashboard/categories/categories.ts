// dashboard/categories/categories.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService, ICategory, ISubCategory } from '../../core/services/categories.service';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class Categories implements OnInit {
  categories: ICategory[] = [];
  subCategories: ISubCategory[] = [];

  isLoading = false;
  isLoadingCategories = false;
  isLoadingSubCategories = false;

  errorMessage = '';
  successMessage = '';

  showCategoryForm = false;
  showSubCategoryForm = false;
  showEditCategoryForm = false;
  showEditSubCategoryForm = false;

  categoryForm: FormGroup;
  subCategoryForm: FormGroup;
  editSubCategoryForm: FormGroup;
  editCategoryForm: FormGroup;

  selectedSubCategory: ISubCategory | null = null;

  selectedCategory: ICategory | null = null;

  constructor(
    private _categoryService: CategoryService,
    private _fb: FormBuilder
  ) {
    this.categoryForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9]+(?:-[a-z0-9]+)*$')]]
    });

    this.subCategoryForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9]+(?:-[a-z0-9]+)*$')]],
      parent: ['']
    });

    this.editSubCategoryForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9]+(?:-[a-z0-9]+)*$')]],
      parent: ['']
    });

    this.editCategoryForm = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9]+(?:-[a-z0-9]+)*$')]]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.errorMessage = '';

    this._categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
        this.isLoadingCategories = false;
        this.loadSubCategories();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories';
        this.isLoadingCategories = false;
        console.error('Error loading categories:', error);
      }
    });
  }

  loadSubCategories(): void {
    this.isLoadingSubCategories = true;
    this._categoryService.getAllSubCategories().subscribe({
      next: (response) => {
        this.subCategories = response.data;
        this.isLoadingSubCategories = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load sub-categories';
        this.isLoadingSubCategories = false;
        console.error('Error loading sub-categories:', error);
      }
    });
  }

  toggleCategoryForm(): void {
    this.showCategoryForm = !this.showCategoryForm;
    if (this.showCategoryForm) {
      this.categoryForm.reset();
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  submitCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this._categoryService.createCategory(this.categoryForm.value).subscribe({
      next: (response) => {
        this.successMessage = 'Category created successfully!';
        this.categories.push(response.data);
        this.toggleCategoryForm();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to create category';
        this.isLoading = false;
        console.error('Error creating category:', error);
      }
    });
  }

  deleteCategory(categoryId: string): void {
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.isLoading = true;
    this.errorMessage = '';

    this._categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.successMessage = 'Category deleted successfully!';
        this.categories = this.categories.filter(c => c._id !== categoryId);
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete category';
        this.isLoading = false;
        console.error('Error deleting category:', error);
      }
    });
  }

  openEditCategory(category: ICategory): void {
    this.selectedCategory = category;
    this.showEditCategoryForm = true;
    this.showCategoryForm = false;
    this.errorMessage = '';
    this.successMessage = '';

    this.editCategoryForm.patchValue({
      name: category.name,
      slug: category.slug
    });
  }

  cancelEditCategory(): void {
    this.showEditCategoryForm = false;
    this.selectedCategory = null;
    this.editCategoryForm.reset();
  }

  updateCategory(): void {
    if (this.editCategoryForm.invalid) {
      this.editCategoryForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    if (!this.selectedCategory) {
      this.errorMessage = 'No category selected for editing';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = { ...this.editCategoryForm.value };

    this._categoryService.updateCategory(this.selectedCategory._id, formData).subscribe({
      next: (response) => {
        this.successMessage = 'Category updated successfully!';

        const index = this.categories.findIndex(c => c._id === this.selectedCategory!._id);
        if (index !== -1) {
          this.categories[index] = response.data;
        }

        this.cancelEditCategory();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update category';
        this.isLoading = false;
        console.error('Error updating category:', error);
      }
    });
  }

  toggleSubCategoryForm(): void {
    this.showSubCategoryForm = !this.showSubCategoryForm;
    this.showEditSubCategoryForm = false;
    this.selectedSubCategory = null;

    if (this.showSubCategoryForm) {
      this.subCategoryForm.reset();
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  submitSubCategory(): void {
    if (this.subCategoryForm.invalid) {
      this.subCategoryForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = { ...this.subCategoryForm.value };
    if (!formData.parent) {
      formData.parent = null;
    }

    this._categoryService.createSubCategory(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Sub-category created successfully!';
        this.subCategories.push(response.data);
        this.toggleSubCategoryForm();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to create sub-category';
        this.isLoading = false;
        console.error('Error creating sub-category:', error);
      }
    });
  }

  deleteSubCategory(subCategoryId: string): void {
    if (!confirm('Are you sure you want to delete this sub-category?')) return;

    this.isLoading = true;
    this.errorMessage = '';

    this._categoryService.deleteSubCategory(subCategoryId).subscribe({
      next: () => {
        this.successMessage = 'Sub-category deleted successfully!';
        this.subCategories = this.subCategories.filter(sc => sc._id !== subCategoryId);
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete sub-category';
        this.isLoading = false;
        console.error('Error deleting sub-category:', error);
      }
    });
  }

  openEditSubCategory(subCategory: ISubCategory): void {
    this.selectedSubCategory = subCategory;
    this.showEditSubCategoryForm = true;
    this.showSubCategoryForm = false;
    this.errorMessage = '';
    this.successMessage = '';

    this.editSubCategoryForm.patchValue({
      name: subCategory.name,
      slug: subCategory.slug,
      parent: this.getParentId(subCategory.parent)
    });
  }

  cancelEditSubCategory(): void {
    this.showEditSubCategoryForm = false;
    this.selectedSubCategory = null;
    this.editSubCategoryForm.reset();
  }

  updateSubCategory(): void {
    if (this.editSubCategoryForm.invalid) {
      this.editSubCategoryForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    if (!this.selectedSubCategory) {
      this.errorMessage = 'No sub-category selected for editing';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = { ...this.editSubCategoryForm.value };
    if (!formData.parent) {
      formData.parent = null;
    }

    this._categoryService.updateSubCategory(this.selectedSubCategory._id, formData).subscribe({
      next: (response) => {
        this.successMessage = 'Sub-category updated successfully!';

        const index = this.subCategories.findIndex(sc => sc._id === this.selectedSubCategory!._id);
        if (index !== -1) {
          this.subCategories[index] = response.data;
        }

        this.cancelEditSubCategory();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update sub-category';
        this.isLoading = false;
        console.error('Error updating sub-category:', error);
      }
    });
  }

  getParentId(parent: any): string {
    if (!parent) return '';

    if (typeof parent === 'object' && parent !== null && '_id' in parent) {
      return parent._id;
    }

    if (typeof parent === 'string') {
      return parent;
    }

    return '';
  }

  getParentCategoryName(parent: any): string {
    if (!parent) return 'No Parent';

    if (typeof parent === 'object' && parent !== null && 'name' in parent) {
      return parent.name;
    }

    if (typeof parent === 'string') {
      const found = this.categories.find(c => c._id === parent);
      return found ? found.name : 'Unknown';
    }

    return 'No Parent';
  }
}
