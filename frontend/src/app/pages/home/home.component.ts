import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { PriceDisplayComponent } from '../../components/price-display/price-display.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, PriceDisplayComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  featured: Product[] = [];

  constructor(private catalog: CatalogService) {}

  ngOnInit(): void {
    this.catalog.getProducts().subscribe((products) => {
      this.featured = products.slice(0, 4);
    });
  }
}
