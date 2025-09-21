import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../shared/models/product';
import { ShopService } from '../../core/services/shop.service';
import { ProductItemComponent } from './product-item/product-item.component';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    ProductItemComponent,
    MatButton,
    MatIconModule
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  private shopService = inject(ShopService);
  private dialogService = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products: Product[] = [];
  searchTerm: string = '';
  selectedBrands: string[] = [];
  selectedTypes: string[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] ?? '';
      const brandsParam = params['brands'] ?? params['brand'] ?? null;
      const typesParam = params['types'] ?? params['type'] ?? null;

      this.selectedBrands = brandsParam ? (brandsParam as string).split(',') : [];
      this.selectedTypes = typesParam ? (typesParam as string).split(',') : [];

      console.log('Query params ricevuti:', {
        search: this.searchTerm,
        brands: this.selectedBrands,
        types: this.selectedTypes
      });

      this.loadProducts();
    });

    this.shopService.getBrands().subscribe({
      next: response => this.shopService.brands = response
    });

    this.shopService.getTypes().subscribe({
      next: response => this.shopService.types = response
    });
  }

  loadProducts() {
    this.shopService.getProducts(this.selectedBrands, this.selectedTypes, this.searchTerm)
      .subscribe({
        next: response => {
          this.products = response.data;
          console.log('Prodotti caricati:', response);
        },
        error: error => console.error('Errore caricamento prodotti', error),
      });
  }

  openFiltersDialog() {
    const dialogRef = this.dialogService.open(FiltersDialogComponent, {
      minWidth: '500px',
      data: {
        selectedBrands: this.selectedBrands,
        selectedTypes: this.selectedTypes
      }
    });

    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          this.selectedBrands = result.selectedBrands;
          this.selectedTypes = result.selectedTypes;

          this.shopService.getProducts(this.selectedBrands, this.selectedTypes).subscribe({
            next: response => this.products = response.data,
            error: error => console.log(error),
          });

          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              search: this.searchTerm,
              brands: this.selectedBrands.join(','),
              types: this.selectedTypes.join(',')
            },
            queryParamsHandling: 'merge'
          });
        }
      }
    });
  }
}
