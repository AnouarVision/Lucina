import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ShopPageComponent} from './layout/shop/shop.component';
import {SkincareRoutineComponent} from './layout/skincare-routine/skincare-routine.component';
import {AboutUsComponent} from './layout/about-us/about-us.component';
import {ContactUsComponent} from './layout/contact-us/contact-us.component';
import {FaqComponent} from './layout/faq/faq.component';
import {HomeComponent} from './layout/home/home.component';
import {CartComponent} from './features/cart/cart.component';
import {OrderSummaryComponent} from './features/cart/order-summary/order-summary.component';
import {CheckoutComponent} from './features/checkout/checkout.component';
import {PaymentProcessingComponent} from './features/payment-processing/payment-processing.component';
import {ProductDetailComponent} from './features/shop/product-detail/product-detail.component';
import {ProfileComponent} from './layout/profile/profile.component';
import {MyProfileComponent} from './layout/my-profile/my-profile.component';
import {WishlistComponent} from './features/wishlist/wishlist.component';
import {ShippingComponent} from './layout/shipping/shipping.component';
import {ReturnsComponent} from './layout/returns/returns.component';
import {PrivacyPolicyComponent} from './layout/privacy-policy/privacy-policy.component';
import {TermsOfServiceComponent} from './layout/terms-of-service/terms-of-service.component';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopPageComponent},
  { path: 'shop/:id', component: ProductDetailComponent},
  { path: 'skincare-routine', component: SkincareRoutineComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'my-profile', component: MyProfileComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'shipping', component: ShippingComponent },
  { path: 'returns', component: ReturnsComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'terms-of-service', component: TermsOfServiceComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'payment-processing', component: PaymentProcessingComponent, canActivate: [authGuard] },
  { path: 'order-summary', component: OrderSummaryComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
