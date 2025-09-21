import {Component, inject} from '@angular/core';
import {MatBadge} from '@angular/material/badge';
import {MatIcon} from '@angular/material/icon';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ShopService} from '../../core/services/shop.service';

@Component({
  selector: 'app-header',
  imports: [
    MatBadge,
    MatIcon,
    RouterLink,
    FormsModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private shopService = inject(ShopService);
  private router = inject(Router);

  searchTerm: string = '';

  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) return;

    this.router.navigate(['/shop'], {queryParams: {search: this.searchTerm}});
  }
}
