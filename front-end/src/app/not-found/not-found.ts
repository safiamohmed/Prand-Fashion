import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  constructor(private router: Router) {}

  // Method to navigate back
  goBack(): void {
    window.history.back();
  }

  // Method for search functionality
  onSearch(query: string): void {
    if (query.trim()) {
      // Navigate to search page or perform search
      console.log('Searching for:', query);
      // this.router.navigate(['/search'], { queryParams: { q: query } });

      // For now, just show alert
      alert(`Search functionality would look for: "${query}"`);
    }
  }
}
