import { Component, inject } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-us',
  imports: [
    MatIcon,
    CommonModule
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
  private router = inject(Router);

  goToShop() {
    this.router.navigate(['/shop']);
  }

  goToContact() {
    this.router.navigate(['/contact-us']);
  }

  values = [
    {
      icon: 'eco',
      title: 'Sostenibilità',
      description: 'Ci impegniamo a selezionare prodotti eco-friendly e packaging responsabile per proteggere il nostro pianeta.'
    },
    {
      icon: 'support_agent',
      title: 'Assistenza',
      description: 'Siamo sempre disponibili per rispondere alle tue domande e guidarti nella scelta dei prodotti migliori.'
    },
    {
      icon: 'star',
      title: 'Qualità',
      description: 'Collaboriamo solo con brand certificati e di fiducia per garantirti prodotti efficaci e sicuri.'
    }
  ];

  timeline = [
    { year: '2020', title: 'La nascita', description: 'Iniziamo il nostro viaggio nel mondo della skincare.' },
    { year: '2021', title: 'Crescita', description: 'Espandiamo il catalogo con nuovi brand premium.' },
    { year: '2022', title: 'Innovazione', description: 'Lanciamo la skincare routine personalizzata.' },
    { year: '2026', title: 'Oggi', description: 'Siamo orgogliosi di servire migliaia di clienti felici.' }
  ];
}

