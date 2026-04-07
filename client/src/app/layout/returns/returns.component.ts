import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './returns.component.html',
})
export class ReturnsComponent {}
