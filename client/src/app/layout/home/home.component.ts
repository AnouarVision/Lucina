import { Component } from '@angular/core';
import {HeroSectionComponent} from "../hero-section/hero-section.component";
import {KBeautyComponent} from "../k-beauty/k-beauty.component";
import {NewsletterComponent} from "../newsletter/newsletter.component";
import {ShopComponent} from "../../features/shop/shop.component";

@Component({
  selector: 'app-home',
    imports: [
        HeroSectionComponent,
        KBeautyComponent,
        NewsletterComponent,
        ShopComponent
    ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
