import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginId = '';
  password = '';
  error = '';
  submitting = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit(): void {
    this.error = '';
    if (!this.loginId.trim() || !this.password) {
      this.error = 'Enter your login ID and password.';
      return;
    }
    this.submitting = true;
    this.auth.login(this.loginId.trim(), this.password).subscribe({
      next: () => {
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.error = err?.error?.error || 'Could not log in.';
        this.submitting = false;
      }
    });
  }
}
