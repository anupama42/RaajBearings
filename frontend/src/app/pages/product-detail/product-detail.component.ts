import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { EnquiryModalComponent } from '../../components/enquiry-modal/enquiry-modal.component';
import { PriceDisplayComponent } from '../../components/price-display/price-display.component';
import { emailEnquiryUrl, whatsappEnquireUrl } from '../../utils/catalog.util';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, EnquiryModalComponent, PriceDisplayComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  showEnquiry = false;

  constructor(
    private route: ActivatedRoute,
    private catalog: CatalogService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.catalog.getProduct(id).subscribe((product) => (this.product = product));
  }

  whatsappUrl(product: Product): string {
    return whatsappEnquireUrl(product);
  }

  emailUrl(product: Product): string {
    return emailEnquiryUrl(product);
  }
}
