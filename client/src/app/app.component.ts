import {Component, inject, OnInit} from '@angular/core';
import {HeaderComponent} from './layout/header/header.component';
import {AnnouncementComponent} from './layout/announcement/announcement.component';
import {HeroSectionComponent} from './layout/hero-section/hero-section.component';
import {KBeautyComponent} from './layout/k-beauty/k-beauty.component';
import {HttpClient} from '@angular/common/http';
import {Product} from './shared/models/product';
import {Pagination} from './shared/models/pagination';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, AnnouncementComponent, HeroSectionComponent, KBeautyComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  baseUrl = 'https://localhost:5001/api/';
  private http = inject(HttpClient);
  protected title = 'Lucina';
  products: Product[] = [];

  ngOnInit(): void {
    this.http.get<Pagination<Product>>(this.baseUrl + 'products').subscribe({
      next: response => this.products = response.data,
      error: error => console.log(error),
      complete: () => console.log('complete'),
    })
  }
}
