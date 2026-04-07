import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  productImageUrl?: string;
}

interface OrderSummary {
  id: number;
  orderDate: string;
  orderStatus: string;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  items: OrderItem[];
}

interface OrderDetail {
  id: number;
  orderDate: string;
  orderStatus: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discount: number;
  couponCode?: string;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  phoneNumber: string;
  shippingMethod: string;
  estimatedDeliveryDays: number;
  paymentStatus: string;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    ReactiveFormsModule
  ],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  userProfile: UserProfile | null = null;
  orders: OrderSummary[] = [];
  wishlist = this.wishlistService.wishlist;
  isLoading = true;
  isLoadingOrders = false;
  error = '';
  isEditing = false;
  isSaving = false;
  activeTab = 0;

  ordersPageIndex = 1;
  readonly ordersPageSize = 8;

  get pagedOrders(): OrderSummary[] {
    const start = (this.ordersPageIndex - 1) * this.ordersPageSize;
    return this.orders.slice(start, start + this.ordersPageSize);
  }

  get ordersTotalPages(): number {
    return Math.ceil(this.orders.length / this.ordersPageSize);
  }

  get ordersHasPrev(): boolean { return this.ordersPageIndex > 1; }
  get ordersHasNext(): boolean { return this.ordersPageIndex < this.ordersTotalPages; }

  ordersNextPage() { if (this.ordersHasNext) this.ordersPageIndex++; }
  ordersPrevPage() { if (this.ordersHasPrev) this.ordersPageIndex--; }

  selectedOrder: OrderDetail | null = null;
  isLoadingOrderDetail = false;

  wishlistPageIndex = 1;
  readonly wishlistPageSize = 8;

  get pagedWishlistItems() {
    const start = (this.wishlistPageIndex - 1) * this.wishlistPageSize;
    return this.wishlist().slice(start, start + this.wishlistPageSize);
  }

  get wishlistTotalPages(): number {
    return Math.ceil(this.wishlist().length / this.wishlistPageSize);
  }

  get wishlistHasPrev(): boolean { return this.wishlistPageIndex > 1; }
  get wishlistHasNext(): boolean { return this.wishlistPageIndex < this.wishlistTotalPages; }

  wishlistNextPage() { if (this.wishlistHasNext) this.wishlistPageIndex++; }
  wishlistPrevPage() { if (this.wishlistHasPrev) this.wishlistPageIndex--; }
  editForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      nationality: [''],
      address: [''],
      city: [''],
      country: [''],
      bio: ['']
    });
  }

  private loadProfile() {
    this.isLoading = true;
    this.error = '';

    this.authService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.patchFormWithProfile(profile);
          this.isLoading = false;
          this.loadOrders();
        },
        error: (err) => {
          console.error('Profile load error:', err);
          this.error = 'Impossibile caricare il profilo';
          this.isLoading = false;
          if (err.status === 401) {
            this.router.navigate(['/profile']);
          }
        }
      });
  }

  private loadOrders() {
    this.isLoadingOrders = true;

    this.authService.getOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.isLoadingOrders = false;
        },
        error: (err) => {
          console.error('Orders load error:', err);
          this.orders = [];
          this.isLoadingOrders = false;
        }
      });
  }

  private patchFormWithProfile(profile: UserProfile) {
    this.editForm.patchValue({
      name: profile.name,
      phone: profile.phone || '',
      nationality: profile.nationality || '',
      address: profile.address || '',
      city: profile.city || '',
      country: profile.country || '',
      bio: profile.bio || ''
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.patchFormWithProfile(this.userProfile!);
    }
  }

  saveProfile() {
    if (this.editForm.invalid) {
      this.error = 'Per favore, compila i campi obbligatori';
      return;
    }

    this.isSaving = true;
    this.error = '';

    const updateData = this.editForm.value;

    this.authService.updateProfile(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedProfile) => {
          this.userProfile = updatedProfile;
          this.isEditing = false;
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Profile update error:', err);
          this.error = 'Errore nell\'aggiornamento del profilo';
          this.isSaving = false;
        }
      });
  }

  viewOrderDetail(id: number) {
    this.isLoadingOrderDetail = true;
    this.authService.getOrderById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.selectedOrder = order;
          this.isLoadingOrderDetail = false;
        },
        error: (err) => {
          console.error('Order detail error:', err);
          this.isLoadingOrderDetail = false;
        }
      });
  }

  closeOrderDetail() {
    this.selectedOrder = null;
  }

  printInvoice(order: OrderDetail) {
    const invoiceNumber = `LUC-${order.id.toString().padStart(6, '0')}`;
    const orderDate = this.formatDate(order.orderDate);
    const paymentDate = order.paymentDate ? this.formatDate(order.paymentDate) : '—';
    const shippingMethodLabel: Record<string, string> = {
      standard: 'Standard (3-5 giorni)',
      express: 'Express (1-2 giorni)',
      overnight: 'Overnight (giorno successivo)'
    };
    const shippingLabel = shippingMethodLabel[order.shippingMethod] ?? order.shippingMethod;

    const statusColors: Record<string, string> = {
      Pending: '#b45309', Processing: '#1d4ed8', Shipped: '#7e22ce',
      Delivered: '#15803d', Cancelled: '#dc2626'
    };
    const statusColor = statusColors[order.orderStatus] ?? '#374151';

    const paymentColors: Record<string, string> = {
      Completed: '#15803d', Pending: '#b45309', Failed: '#dc2626', Refunded: '#0369a1'
    };
    const paymentColor = paymentColors[order.paymentStatus] ?? '#374151';

    const itemsRows = order.items.map(i => `
      <tr>
        <td style="padding:10px 12px">${i.productName}</td>
        <td style="padding:10px 12px;text-align:center">${i.quantity}</td>
        <td style="padding:10px 12px;text-align:right">€${i.unitPrice.toFixed(2)}</td>
        <td style="padding:10px 12px;text-align:right;font-weight:600">€${(i.unitPrice * i.quantity).toFixed(2)}</td>
      </tr>`).join('');

    const discountRow = order.discount > 0
      ? `<tr><td colspan="3" style="padding:6px 12px;text-align:right;color:#15803d">
           Sconto${order.couponCode ? ' (' + order.couponCode + ')' : ''}</td>
           <td style="padding:6px 12px;text-align:right;color:#15803d">-€${order.discount.toFixed(2)}</td></tr>` : '';

    const taxRow = order.taxAmount > 0
      ? `<tr><td colspan="3" style="padding:6px 12px;text-align:right;color:#6b7280">IVA / Tasse</td>
           <td style="padding:6px 12px;text-align:right;color:#6b7280">€${order.taxAmount.toFixed(2)}</td></tr>` : '';

    const notesSection = order.notes
      ? `<div style="margin-top:24px;padding:14px 16px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px">
           <p style="margin:0;font-size:13px;color:#92400e"><strong>Note:</strong> ${order.notes}</p></div>` : '';

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Fattura ${invoiceNumber} — Lucina</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #374151; background: #fff; }
    .page { max-width: 760px; margin: 0 auto; padding: 40px 48px; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 28px; border-bottom: 2px solid #a9876e; }
    .brand-name { font-size: 28px; font-weight: 800; color: #a9876e; letter-spacing: -0.5px; }
    .brand-tagline { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-title { font-size: 20px; font-weight: 700; color: #1f2937; }
    .invoice-number { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .invoice-date { font-size: 12px; color: #9ca3af; margin-top: 2px; }

    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1.5px solid currentColor; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 28px 0; }
    .info-box h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; margin-bottom: 6px; }
    .info-box p { font-size: 13px; color: #374151; line-height: 1.5; }

    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    thead tr { background: #f7f1eb; }
    thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #6b7280; }
    thead th:nth-child(2) { text-align: center; }
    thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
    tbody tr { border-bottom: 1px solid #f3f4f6; }
    tbody tr:last-child { border-bottom: none; }
    tfoot tr td { padding: 6px 12px; }

    .totals-separator { border-top: 2px solid #a9876e; }
    .grand-total td { font-size: 16px; font-weight: 800; color: #a9876e; padding: 10px 12px !important; }

    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 11px; color: #9ca3af; }

    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
<div class="page">

  <div class="header">
    <div>
      <div class="brand-name">Lucina</div>
      <div class="brand-tagline">K-Beauty &amp; Skincare</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">Fattura / Ricevuta</div>
      <div class="invoice-number">${invoiceNumber}</div>
      <div class="invoice-date">Emessa il ${orderDate}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h4>Indirizzo di spedizione</h4>
      <p>${order.shippingAddress}<br>
         ${order.shippingCity} ${order.shippingPostalCode}<br>
         ${order.shippingCountry}<br>
         Tel: ${order.phoneNumber}</p>
    </div>
    <div class="info-box">
      <h4>Spedizione</h4>
      <p>${shippingLabel}<br>
         Consegna stimata: ${order.estimatedDeliveryDays} gg lav.</p>
    </div>
    <div class="info-box">
      <h4>Metodo di pagamento</h4>
      <p>
        ${order.paymentMethod ? `<span style="font-size:12px;color:#374151;margin-top:6px;display:block">${order.paymentMethod}</span>` : ''}
      </p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Prodotto</th>
        <th>Qtà</th>
        <th>Prezzo unit.</th>
        <th>Importo</th>
      </tr>
    </thead>
    <tbody>${itemsRows}</tbody>
    <tfoot>
      <tr><td colspan="3" style="text-align:right;color:#6b7280;padding:6px 12px">Subtotale</td>
          <td style="text-align:right;padding:6px 12px">€${order.subtotal.toFixed(2)}</td></tr>
      <tr><td colspan="3" style="text-align:right;color:#6b7280;padding:6px 12px">Spedizione (${shippingLabel})</td>
          <td style="text-align:right;padding:6px 12px">€${order.shippingCost.toFixed(2)}</td></tr>
      ${taxRow}
      ${discountRow}
      <tr class="totals-separator grand-total">
        <td colspan="3" style="text-align:right">Totale</td>
        <td style="text-align:right">€${order.total.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>

  ${notesSection}

  <div class="footer">
    <p>Lucina K-Beauty &bull; lucina.store &bull; support@lucina.store</p>
    <p>Documento generato il ${new Date().toLocaleDateString('it-IT')} &bull; ${invoiceNumber}</p>
  </div>

</div>
</body>
</html>`;

    const w = window.open('', '_blank')!;
    w.document.write(html);
    w.document.close();
    w.print();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  addWishlistItemToCart(item: any) {
    this.cartService.addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || '',
      quantity: 1
    });
  }

  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromWishlist(productId);
  }
}
