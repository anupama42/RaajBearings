import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { PriceDisplayComponent } from '../../components/price-display/price-display.component';
import { whatsappCartUrl } from '../../utils/catalog.util';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink, PriceDisplayComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private catalog: CatalogService,
    private wishlist: WishlistService,
    public auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    if (this.auth.isLoggedIn()) {
      this.http.get<Product[]>('/api/enquiry-cart').subscribe((products) => {
        this.products = products;
      });
      return;
    }
    const ids = this.wishlist.list();
    this.catalog.getProducts().subscribe((products) => {
      this.products = products.filter((product) => ids.includes(product.id));
    });
  }

  remove(id: number): void {
    this.wishlist.remove(id, () => this.refresh());
  }

  whatsappUrl(): string {
    return whatsappCartUrl(this.products);
  }
}
