import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ShopPageComponent} from './layout/shop/shop.component';
import {SkincareRoutineComponent} from './layout/skincare-routine/skincare-routine.component';
import {AboutUsComponent} from './layout/about-us/about-us.component';
import {ContactUsComponent} from './layout/contact-us/contact-us.component';
import {FaqComponent} from './layout/faq/faq.component';
import {HomeComponent} from './layout/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopPageComponent},
  { path: 'skincare-routine', component: SkincareRoutineComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'faq', component: FaqComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
