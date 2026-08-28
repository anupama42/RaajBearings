import { Component, Input } from '@angular/core';
import { Product } from '../../models/catalog.models';
import { formatInr, starLabel } from '../../utils/catalog.util';

@Component({
  selector: 'app-price-display',
  templateUrl: './price-display.component.html',
  styleUrl: './price-display.component.css'
})
export class PriceDisplayComponent {
  @Input({ required: true }) product!: Product;

  formatInr = formatInr;
  starLabel = starLabel;
}
