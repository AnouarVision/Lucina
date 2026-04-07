import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { AuthService } from '../../core/services/auth.service';
import { CouponService } from '../../core/services/coupon.service';
import { MatIconModule } from '@angular/material/icon';
import { CreateOrderRequest, CreateOrderItemRequest } from '../../shared/models/order';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DecimalPipe, MatIconModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private checkoutService = inject(CheckoutService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private couponService = inject(CouponService);

  cart = this.cartService.cart;
  isAuthenticated = this.authService.isAuthenticated;

  Math = Math;

  checkoutForm!: FormGroup;
  isLoading = signal(false);
  isProcessing = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  currentStep = signal<'shipping' | 'payment' | 'review'>('shipping');

  shippingOptions: ShippingOption[] = [
    { id: 'standard', name: 'Spedizione Standard (5-7 gg)', price: 5, days: 7 },
    { id: 'express', name: 'Spedizione Express (1-2 gg)', price: 15, days: 2 },
    { id: 'overnight', name: 'Spedizione Notturna (24h)', price: 25, days: 1 }
  ];

  appliedCoupon = this.couponService.appliedCoupon;
  discountPercent = this.couponService.discountPercent;

  couponInput = '';
  couponError = signal('');
  couponLoading = signal(false);
  selectedShipping = signal<ShippingOption>(this.shippingOptions[0]);
  paymentMethod = signal<'card' | 'applepay'>('card');

  ngOnInit() {
    if (!this.authService.getToken()) {
      this.router.navigate(['/profile']);
      return;
    }

    const authenticatedUserId = this.authService.getUserId()?.toString();
    if (this.cart().userId === 'guest' && authenticatedUserId) {
      this.cartService.loadCartFromApi(authenticatedUserId).subscribe();
    }

    this.initForm();
  }

  private initForm() {
    this.checkoutForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(9)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.minLength(4)]],
      country: ['Italy', Validators.required],
      shippingMethod: ['standard', Validators.required],

      cardholderName: ['', [Validators.required, Validators.minLength(3)]],
      cardNumber: ['', [Validators.required, Validators.minLength(15)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],

      couponCode: [''],
      notes: ['']
    });
  }

  applyCoupon() {
    const code = this.couponInput.trim();
    if (!code) return;

    this.couponLoading.set(true);
    this.couponError.set('');

    this.couponService.validate(code).subscribe({
      next: res => {
        this.couponLoading.set(false);
        if (res.valid) {
          this.couponService.setCoupon(code, res.discountPercent);
          this.couponError.set('');
        } else {
          this.couponError.set(res.message);
        }
      },
      error: () => {
        this.couponLoading.set(false);
        this.couponError.set('Errore nella verifica del codice.');
      }
    });
  }

  removeCoupon() {
    this.couponInput = '';
    this.couponService.clearCoupon();
    this.couponError.set('');
  }

  setShippingMethod(method: ShippingOption) {
    this.selectedShipping.set(method);
    this.checkoutForm.get('shippingMethod')?.setValue(method.id);
  }

  setPaymentMethod(method: 'card' | 'applepay') {
    this.paymentMethod.set(method);
    this.errorMessage.set('');
  }

  goToStep(step: 'shipping' | 'payment' | 'review') {
    if (step === 'payment' && !this.isShippingValid()) {
      this.errorMessage.set('Compila tutti i dati di spedizione');
      return;
    }
    this.currentStep.set(step);
    this.errorMessage.set('');
  }

  private isShippingValid(): boolean {
    const shippingControls = ['firstName', 'lastName', 'phoneNumber', 'address', 'city', 'postalCode', 'country'];
    return shippingControls.every(control => this.checkoutForm.get(control)?.valid);
  }

  private isPaymentValid(): boolean {
    if (this.paymentMethod() === 'applepay') {
      return true;
    }
    const paymentControls = ['cardholderName', 'cardNumber', 'expiryDate', 'cvv'];
    return paymentControls.every(control => this.checkoutForm.get(control)?.valid);
  }

  async completeCheckout() {
    if (!this.isShippingValid() || !this.isPaymentValid()) {
      this.errorMessage.set('Completa tutti i campi richiesti');
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');

    try {
      const items: CreateOrderItemRequest[] = this.cart().items.map(item => ({
        productId: item.productId,
        productName: item.name,
        productImageUrl: item.imageUrl || '',
        unitPrice: item.price,
        quantity: item.quantity
      }));

      const subtotal = this.subtotal;
      const discount = subtotal * (this.discountPercent() / 100);
      const isFreeShipping = subtotal >= 65 && this.selectedShipping().id === 'standard';
      const shippingCost = isFreeShipping ? 0 : this.selectedShipping().price;
      const taxableAmount = subtotal - discount + shippingCost;
      const tax = taxableAmount * 0.1;
      const total = taxableAmount + tax;

      const createOrderRequest: CreateOrderRequest = {
        shippingAddress: this.checkoutForm.get('address')?.value,
        shippingCity: this.checkoutForm.get('city')?.value,
        shippingPostalCode: this.checkoutForm.get('postalCode')?.value,
        shippingCountry: this.checkoutForm.get('country')?.value,
        phoneNumber: this.checkoutForm.get('phoneNumber')?.value,
        shippingMethod: this.selectedShipping().id,
        paymentMethod: this.resolvePaymentMethodLabel(),
        couponCode: this.appliedCoupon() || undefined,
        subtotal,
        shippingCost,
        taxAmount: tax,
        discount,
        total,
        items
      };

      const userId = this.authService.getUserId();

      if (userId === null || userId === undefined) {
        this.errorMessage.set('Utente non autenticato. Effettua il login.');
        this.isProcessing.set(false);
        return;
      }

      this.checkoutService.createOrder(userId.toString(), createOrderRequest).subscribe({
        next: (orderResponse) => {
          if (orderResponse?.success || orderResponse?.orderId) {
            const orderId = orderResponse.orderId;

            this.router.navigate(['/payment-processing'], {
              queryParams: {
                orderId: orderId,
                method: this.paymentMethod()
              }
            });
          } else {
            this.errorMessage.set(orderResponse?.message || 'Errore nella creazione dell\'ordine');
            this.isProcessing.set(false);
          }
        },
        error: (error) => {
          let errorMsg = 'Errore nel checkout';

          if (error?.error?.message) {
            errorMsg = error.error.message;
          } else if (error?.message) {
            errorMsg = error.message;
          } else if (error?.status === 0) {
            errorMsg = 'Impossibile connettere al server. Verifica che il backend sia in esecuzione.';
          } else if (error?.status === 400) {
            errorMsg = error?.error?.message || 'Dati non validi';
          } else if (error?.status === 500) {
            errorMsg = 'Errore del server. Contatta il supporto.';
          }

          this.errorMessage.set(errorMsg);
          this.isProcessing.set(false);
        }
      });
    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Errore nel checkout');
      this.isProcessing.set(false);
    }
  }

  get subtotal(): number {
    return this.cart().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get discount(): number {
    return this.subtotal * (this.discountPercent() / 100);
  }

  get shippingCost(): number {
    const isFreeShipping = this.subtotal >= 65 && this.selectedShipping().id === 'standard';
    return isFreeShipping ? 0 : this.selectedShipping().price;
  }

  get taxableAmount(): number {
    return this.subtotal - this.discount + this.shippingCost;
  }

  get tax(): number {
    return this.taxableAmount * 0.1;
  }

  get total(): number {
    return this.taxableAmount + this.tax;
  }

  get itemCount(): number {
    return this.cart().items.reduce((sum, item) => sum + item.quantity, 0);
  }

  goBack() {
    this.router.navigate(['/cart']);
  }

  formatCardNumber(event: any) {
    const input = event.target;
    let value = input.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
    input.value = formattedValue;
    this.checkoutForm.get('cardNumber')?.setValue(formattedValue, { emitEvent: false });
  }

  private resolvePaymentMethodLabel(): string {
    if (this.paymentMethod() === 'applepay') return 'Apple Pay';
    const cardNumber: string = (this.checkoutForm.get('cardNumber')?.value ?? '').replace(/\s/g, '');
    if (cardNumber.startsWith('4')) return 'Carta Visa';
    if (cardNumber.startsWith('5')) return 'Carta Mastercard';
    if (cardNumber.startsWith('3')) return 'Carta American Express';
    return 'Carta di credito';
  }
}
