import {Component, Input} from '@angular/core';
import {Product} from '../../../shared/models/product';
import {CurrencyPipe} from '@angular/common';
import {MatCard, MatCardActions, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-product-item',
  imports: [
    CurrencyPipe,
    MatCard,
    MatCardSubtitle,
    MatCardTitle,
    MatCardActions,
    MatButton,
    MatIconModule
  ],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {
  @Input() product?: Product;
}
