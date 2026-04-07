import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CheckoutService } from '../../core/services/checkout.service';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-payment-processing',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './payment-processing.component.html',
  styleUrls: ['./payment-processing.component.scss']
})
export class PaymentProcessingComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private checkoutService = inject(CheckoutService);
  private cartService = inject(CartService);

  Math = Math;

  orderId: number = 0;
  paymentMethod = signal<'card' | 'applepay'>('card');
  processingStatus = signal<'processing' | 'success' | 'error'>('processing');
  errorMessage = signal('');
  progress = signal(0);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderId = parseInt(params['orderId']) || 0;
      this.paymentMethod.set((params['method'] as 'card' | 'applepay') || 'card');

      if (this.orderId > 0) {
        this.processPayment();
      }
    });
  }

  private processPayment() {
    const progressInterval = setInterval(() => {
      const current = this.progress();
      if (current < 90) {
        this.progress.set(current + Math.random() * 30);
      }
    }, 300);

    setTimeout(() => {
      clearInterval(progressInterval);
      this.progress.set(100);

      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        this.cartService.clearCart();
        this.processingStatus.set('success');

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      } else {
        this.processingStatus.set('error');
        this.errorMessage.set('Purtroppo il pagamento non è stato elaborato. Riprova più tardi.');
      }
    }, 2500);
  }

  retryPayment() {
    this.progress.set(0);
    this.processingStatus.set('processing');
    this.errorMessage.set('');
    this.processPayment();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goBack() {
    this.router.navigate(['/checkout']);
  }
}
