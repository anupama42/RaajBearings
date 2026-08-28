import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { isValidEmail } from '../../utils/catalog.util';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  loginId = '';
  password = '';
  name = '';
  email = '';
  phone = '';
  city = '';
  company = '';
  error = '';
  submitting = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit(): void {
    this.error = '';
    if (!/^[a-zA-Z0-9._-]{4,30}$/.test(this.loginId.trim())) {
      this.error = 'Login ID must be 4-30 letters, numbers, dot, underscore or hyphen.';
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(this.password)) {
      this.error = 'Password must be at least 8 characters and include a letter and a number.';
      return;
    }
    if (this.name.trim().length < 2) {
      this.error = 'Enter your name.';
      return;
    }
    if (!isValidEmail(this.email)) {
      this.error = 'Enter a valid email address.';
      return;
    }
    this.submitting = true;
    this.auth.register({
      loginId: this.loginId.trim(),
      password: this.password,
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      city: this.city.trim(),
      company: this.company.trim()
    }).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: (err) => {
        this.error = err?.error?.error || 'Could not create the account.';
        this.submitting = false;
      }
    });
  }
}
