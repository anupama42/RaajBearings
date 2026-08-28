import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { isValidEmail, isValidPhone } from '../../utils/catalog.util';

@Component({
  selector: 'app-enquiry-modal',
  imports: [FormsModule],
  templateUrl: './enquiry-modal.component.html',
  styleUrl: './enquiry-modal.component.css'
})
export class EnquiryModalComponent {
  @Input({ required: true }) product!: Product;
  @Output() closed = new EventEmitter<void>();

  name = '';
  email = '';
  phone = '';
  city = '';
  company = '';
  message = '';
  submitting = false;
  success = false;
  error = '';
  fieldErrors: Record<string, string> = {};

  constructor(private catalog: CatalogService) {}

  submit(): void {
    this.error = '';
    this.fieldErrors = {};

    if (this.name.trim().length < 2) {
      this.fieldErrors['name'] = 'Enter your full name.';
    }
    if (!isValidEmail(this.email)) {
      this.fieldErrors['email'] = 'Enter a valid email address.';
    }
    if (!isValidPhone(this.phone)) {
      this.fieldErrors['phone'] = 'Enter a valid 10-digit mobile number.';
    }
    if (this.city.trim().length < 2) {
      this.fieldErrors['city'] = 'Enter your city.';
    }
    if (this.message.trim().length < 10) {
      this.fieldErrors['message'] = 'Message should be at least 10 characters.';
    }
    if (Object.keys(this.fieldErrors).length) {
      this.error = 'Please correct the highlighted fields.';
      return;
    }

    this.submitting = true;
    this.catalog.sendEnquiry({
      productId: this.product.id,
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      city: this.city.trim(),
      company: this.company.trim(),
      message: this.message.trim()
    }).subscribe({
      next: () => {
        this.success = true;
        this.submitting = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Could not send enquiry. Please try again.';
        this.submitting = false;
      }
    });
  }
}
