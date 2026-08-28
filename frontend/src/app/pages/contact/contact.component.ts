import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../services/catalog.service';
import { isValidEmail, isValidPhone } from '../../utils/catalog.util';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  name = '';
  email = '';
  phone = '';
  company = '';
  message = '';
  sending = false;
  sent = false;
  error = '';

  constructor(private catalog: CatalogService) {}

  submit(): void {
    this.error = '';
    if (this.name.trim().length < 2) {
      this.error = 'Enter your name.';
      return;
    }
    if (!isValidEmail(this.email)) {
      this.error = 'Enter a valid email address.';
      return;
    }
    if (this.phone && !isValidPhone(this.phone)) {
      this.error = 'Enter a valid 10-digit mobile number.';
      return;
    }
    this.sending = true;
    this.catalog.sendContact({
      name: this.name,
      email: this.email,
      phone: this.phone,
      company: this.company,
      message: this.message
    }).subscribe({
      next: () => {
        this.sent = true;
        this.sending = false;
      },
      error: () => {
        this.error = 'Could not send the message. Please try again.';
        this.sending = false;
      }
    });
  }
}
