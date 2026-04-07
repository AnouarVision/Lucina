import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NewsletterService } from '../../core/services/newsletter.service';

@Component({
  selector: 'app-newsletter',
  imports: [FormsModule, CommonModule],
  templateUrl: './newsletter.component.html',
  styleUrl: './newsletter.component.scss'
})
export class NewsletterComponent {
  private newsletterService = inject(NewsletterService);

  email = '';
  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  subscribe() {
    const trimmed = this.email.trim();
    if (!trimmed || !this.isValidEmail(trimmed)) {
      this.errorMessage.set('Inserisci un indirizzo email valido.');
      return;
    }

    this.loading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.newsletterService.subscribe(trimmed).subscribe({
      next: res => {
        this.loading.set(false);
        this.successMessage.set(res.message);
        this.email = '';
        setTimeout(() => this.successMessage.set(''), 1000);
      },
      error: err => {
        this.loading.set(false);
        const msg = err?.error?.message;
        if (err?.status === 409) {
          this.errorMessage.set(msg || 'Questa email è già iscritta.');
        } else {
          this.errorMessage.set(msg || 'Errore durante l\'iscrizione. Riprova più tardi.');
        }
      }
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
