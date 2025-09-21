import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../../shared/models/product';
import { Pagination } from '../../shared/models/pagination';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  baseUrl = 'https://localhost:5001/api/';
  private http = inject(HttpClient);

  types: string[] = [];
  brands: string[] = [];

  getProducts(brands?: string[], types?: string[], search?: string): Observable<Pagination<Product>> {
    let params = new HttpParams();

    if (brands && brands.length > 0) {
      params = params.append('brands', brands.join(','));
    }

    if (types && types.length > 0) {
      params = params.append('types', types.join(','));
    }

    if(search && search.trim() != '') {
      params = params.append('search', search);
    }

    params = params.append('pageSize', 10);

    return this.http.get<Pagination<Product>>(this.baseUrl + 'products', { params });
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(this.baseUrl + 'products/brands');
  }

  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(this.baseUrl + 'products/types');
  }
}
