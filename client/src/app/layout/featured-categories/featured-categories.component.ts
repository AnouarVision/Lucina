import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-featured-categories',
  imports: [RouterLink, MatIconModule],
  templateUrl: './featured-categories.component.html',
  styleUrl: './featured-categories.component.scss'
})
export class FeaturedCategoriesComponent {
  categories = [
    { label: 'Detergenti', sublabel: 'Il primo passo della routine', icon: 'bubble_chart', filter: 'Cleanser' },
    { label: 'Toner & Essenze', sublabel: 'Equilibrio e idratazione base', icon: 'water_drop', filter: 'Toner' },
    { label: 'Sieri & Ampolle', sublabel: 'Trattamenti concentrati', icon: 'science', filter: 'Serum' },
    { label: 'Idratanti', sublabel: 'Morbidezza e nutrimento', icon: 'spa', filter: 'Moisturizer' },
    { label: 'Protezione Solare', sublabel: 'Scudo contro i raggi UV', icon: 'wb_sunny', filter: 'Sunscreen' },
    { label: 'Maschere', sublabel: 'Il rituale settimanale', icon: 'face_retouching_natural', filter: 'Mask' },
  ];
}
