import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { WishlistService } from './services/wishlist.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  searchQuery = '';

  constructor(
    private router: Router,
    public wishlist: WishlistService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.wishlist.loadFromServer();
    }
  }

  search(): void {
    const q = this.searchQuery.trim();
    this.router.navigate(['/products'], { queryParams: q ? { q } : {} });
  }
}
