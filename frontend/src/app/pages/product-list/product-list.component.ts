import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FilterOptions, Product, SearchOptions } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { WishlistService } from '../../services/wishlist.service';
import { PriceDisplayComponent } from '../../components/price-display/price-display.component';
import { emailEnquiryUrl, whatsappEnquireUrl } from '../../utils/catalog.util';
import { EnquiryModalComponent } from '../../components/enquiry-modal/enquiry-modal.component';

@Component({
  selector: 'app-product-list',
  imports: [FormsModule, RouterLink, EnquiryModalComponent, PriceDisplayComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filters: FilterOptions = { discount: [], rating: [], C: [], D: [] };
  searchOptions: SearchOptions = { brands: [], types: [] };
  brand = '';
  type = '';
  minDiscount = '';
  q = '';
  enquiryProduct: Product | null = null;

  constructor(
    private catalog: CatalogService,
    private wishlist: WishlistService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.catalog.getFilters().subscribe((filters) => (this.filters = filters));
    this.catalog.getSearchOptions().subscribe((options) => (this.searchOptions = options));
    this.route.queryParamMap.subscribe((params) => {
      this.q = params.get('q') || '';
      this.load();
    });
  }

  load(): void {
    this.catalog.getProducts({
      brand: this.brand,
      type: this.type,
      minDiscount: this.minDiscount,
      q: this.q
    }).subscribe((products) => (this.products = products));
  }

  applySearch(): void {
    this.router.navigate(['/products'], {
      queryParams: { q: this.q || null },
      queryParamsHandling: 'merge'
    });
  }

  clearFilters(): void {
    this.brand = '';
    this.type = '';
    this.minDiscount = '';
    this.q = '';
    this.router.navigate(['/products']);
    this.load();
  }

  filterSummary(): string {
    const parts: string[] = [];
    if (this.q) parts.push(`Search “${this.q}”`);
    if (this.brand) parts.push(`Brand: ${this.brand}`);
    if (this.type) parts.push(`Type: ${this.type}`);
    const discount = this.filters.discount.find((item) => item.value === this.minDiscount);
    if (discount) parts.push(`Discount: ${discount.label}`);
    return parts.length ? parts.join(' · ') : 'None';
  }

  whatsappUrl(product: Product): string {
    return whatsappEnquireUrl(product);
  }

  emailUrl(product: Product): string {
    return emailEnquiryUrl(product);
  }

  inCart(product: Product): boolean {
    return this.wishlist.has(product.id);
  }

  toggleCart(product: Product): void {
    this.wishlist.toggle(product.id);
  }
}
