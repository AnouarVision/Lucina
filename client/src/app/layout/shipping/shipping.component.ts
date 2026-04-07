import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './shipping.component.html',
})
export class ShippingComponent {}
