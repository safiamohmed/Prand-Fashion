import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestimonialService, ITestimonial } from '../../core/services/testimonial.service';
@Component({
  selector: 'app-feedback',
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css',
})
export class Feedback implements OnInit, OnDestroy {
  testimonials: ITestimonial[] = [];
  currentIndex = 0;
  isLoading = false;
  errorMessage = '';
  intervalId: any;
  showForm = false;
  newTestimonial = {
    rating: 5,
    comment: ''
  };

  constructor(private testimonialService: TestimonialService) {}

  ngOnInit() {
    this.loadTestimonials();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  loadTestimonials() {
    this.isLoading = true;
    this.testimonialService.getTestimonials().subscribe({
      next: (response) => {
        this.testimonials = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load testimonials';
        this.isLoading = false;
        console.error('Error loading testimonials:', error);
      }
    });
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000); // الانتقال كل 5 ثواني
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    if (this.testimonials.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
    }
  }

  prevSlide() {
    if (this.testimonials.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
    }
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  openTestimonialForm() {
    this.showForm = true;
  }

  closeTestimonialForm() {
    this.showForm = false;
    this.newTestimonial = {
      rating: 5,
      comment: ''
    };
  }

  submitTestimonial() {
    if (!this.newTestimonial.comment.trim()) {
      this.errorMessage = 'Please write your testimonial';
      return;
    }

    if (this.newTestimonial.comment.length < 10) {
      this.errorMessage = 'Testimonial must be at least 10 characters';
      return;
    }

    this.isLoading = true;
    this.testimonialService.addTestimonial(this.newTestimonial).subscribe({
      next: () => {
        this.loadTestimonials();
        this.closeTestimonialForm();
        this.isLoading = false;
        alert('Thank you for your testimonial!');
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to submit testimonial';
        this.isLoading = false;
      }
    });
  }

  setRating(rating: number) {
    this.newTestimonial.rating = rating;
  }

  getStars(rating: number): string[] {
    return this.testimonialService.getStars(rating);
  }

  formatDate(date: string | Date): string {
    return this.testimonialService.formatDate(date);
  }

  getCurrentTestimonial(): ITestimonial | null {
    return this.testimonials[this.currentIndex] || null;
  }
}
