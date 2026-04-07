import { Component } from '@angular/core';
import {HeroSectionComponent} from "../hero-section/hero-section.component";
import {KBeautyComponent} from "../k-beauty/k-beauty.component";
import {NewsletterComponent} from "../newsletter/newsletter.component";
import {ShopComponent} from "../../features/shop/shop.component";
import { ChatbotWidgetComponent } from "../../shared/components/chatbot-widget/chatbot-widget.component";
import { FeaturedCategoriesComponent } from '../featured-categories/featured-categories.component';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
    imports: [
        HeroSectionComponent,
        KBeautyComponent,
        NewsletterComponent,
        ShopComponent,
        ChatbotWidgetComponent,
        FeaturedCategoriesComponent,
        RouterLink,
        MatIconModule,
    ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
