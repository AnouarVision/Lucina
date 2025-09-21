import {Component, inject, OnInit} from '@angular/core';
import {HeaderComponent} from './layout/header/header.component';
import {AnnouncementComponent} from './layout/announcement/announcement.component';
import {HeroSectionComponent} from './layout/hero-section/hero-section.component';
import {KBeautyComponent} from './layout/k-beauty/k-beauty.component';
import {ShopComponent} from './features/shop/shop.component';
import {NewsletterComponent} from './layout/newsletter/newsletter.component';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from './layout/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, AnnouncementComponent, HeroSectionComponent, KBeautyComponent, ShopComponent, NewsletterComponent, RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Lucina';
}
