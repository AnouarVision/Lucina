import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../shared/models/product';
import { ShopService } from '../../core/services/shop.service';
import { ProductItemComponent } from './product-item/product-item.component';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    ProductItemComponent,
    MatIconModule,
    FormsModule,
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
  sortBy: string = '';

  readonly categories = [
    { label: 'Cleanser',   icon: 'bubble_chart',       type: 'Cleanser' },
    { label: 'Toner',      icon: 'water_drop',          type: 'Toner' },
    { label: 'Essence',    icon: 'science',             type: 'Essence' },
    { label: 'Serum',      icon: 'colorize',            type: 'Serum' },
    { label: 'Cream',      icon: 'workspaces',          type: 'Cream' },
    { label: 'Mask',       icon: 'spa',                 type: 'Mask' },
    { label: 'Sheet Mask', icon: 'face_retouching_natural', type: 'Sheet Mask' },
  ];

  pageIndex = 1;
  readonly pageSize = 8;
  totalCount = 0;
  isLoading = false;

  readonly sortOptions = [
    { value: '', label: 'Per nome' },
    { value: 'priceAsc', label: 'Prezzo crescente' },
    { value: 'priceDesc', label: 'Prezzo decrescente' },
  ];

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get hasPrevPage(): boolean {
    return this.pageIndex > 1;
  }

  get hasNextPage(): boolean {
    return this.pageIndex < this.totalPages;
  }

  get activeFiltersCount(): number {
    return this.selectedBrands.length + this.selectedTypes.length;
  }

  get activeFilterChips(): { label: string; type: 'brand' | 'type' }[] {
    return [
      ...this.selectedBrands.map(b => ({ label: b, type: 'brand' as const })),
      ...this.selectedTypes.map(t => ({ label: t, type: 'type' as const })),
    ];
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] ?? '';
      const brandsParam = params['brands'] ?? params['brand'] ?? null;
      const typesParam = params['types'] ?? params['type'] ?? null;

      this.selectedBrands = brandsParam ? (brandsParam as string).split(',') : [];
      this.selectedTypes = typesParam ? (typesParam as string).split(',') : [];

      this.pageIndex = 1;
      this.loadProducts();
    });

    this.shopService.getBrands().subscribe({
      next: response => this.shopService.brands = response
    });

    this.shopService.getTypes().subscribe({
      next: response => this.shopService.types = response
    });
  }

  filterByType(type: string) {
    const idx = this.selectedTypes.indexOf(type);
    if (idx === -1) {
      this.selectedTypes = [type];
    } else {
      this.selectedTypes = [];
    }
    this.selectedBrands = [];
    this.pageIndex = 1;
    this.syncQueryParams();
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.shopService.getProducts(this.selectedBrands, this.selectedTypes, this.searchTerm, this.pageIndex, this.pageSize, this.sortBy)
      .subscribe({
        next: response => {
          this.products = response.data;
          this.totalCount = response.count;
          this.isLoading = false;
        },
        error: error => {
          console.error('Errore caricamento prodotti', error);
          this.isLoading = false;
        },
      });
  }

  onSortChange() {
    this.pageIndex = 1;
    this.loadProducts();
  }

  removeFilter(chip: { label: string; type: 'brand' | 'type' }) {
    if (chip.type === 'brand') {
      this.selectedBrands = this.selectedBrands.filter(b => b !== chip.label);
    } else {
      this.selectedTypes = this.selectedTypes.filter(t => t !== chip.label);
    }
    this.pageIndex = 1;
    this.syncQueryParams();
    this.loadProducts();
  }

  clearAllFilters() {
    this.selectedBrands = [];
    this.selectedTypes = [];
    this.pageIndex = 1;
    this.syncQueryParams();
    this.loadProducts();
  }

  nextPage() {
    if (this.hasNextPage) {
      this.pageIndex++;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.hasPrevPage) {
      this.pageIndex--;
      this.loadProducts();
    }
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
          this.pageIndex = 1;
          this.syncQueryParams();
          this.loadProducts();
        }
      }
    });
  }

  private syncQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchTerm || null,
        brands: this.selectedBrands.length ? this.selectedBrands.join(',') : null,
        types: this.selectedTypes.length ? this.selectedTypes.join(',') : null,
      },
      queryParamsHandling: 'merge'
    });
  }
}
