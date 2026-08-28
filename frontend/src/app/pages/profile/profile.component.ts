import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/auth.models';
import { isValidEmail } from '../../utils/catalog.util';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  name = '';
  email = '';
  phone = '';
  city = '';
  company = '';
  currentPassword = '';
  newPassword = '';
  message = '';
  error = '';
  saving = false;

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.auth.profile().subscribe({
      next: (user) => this.fill(user),
      error: () => {
        const cached = this.auth.currentUser();
        if (cached) this.fill(cached);
      }
    });
  }

  fill(user: UserProfile): void {
    this.profile = user;
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.city = user.city;
    this.company = user.company;
  }

  save(): void {
    this.error = '';
    this.message = '';
    if (this.name.trim().length < 2) {
      this.error = 'Enter your name.';
      return;
    }
    if (!isValidEmail(this.email)) {
      this.error = 'Enter a valid email address.';
      return;
    }
    this.saving = true;
    this.auth.updateProfile({
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      city: this.city.trim(),
      company: this.company.trim(),
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: (user) => {
        this.fill(user);
        this.currentPassword = '';
        this.newPassword = '';
        this.message = 'Profile saved.';
        this.saving = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Could not save the profile.';
        this.saving = false;
      }
    });
  }
}
