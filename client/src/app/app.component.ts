import {Component} from '@angular/core';
import {HeaderComponent} from './layout/header/header.component';
import {AnnouncementComponent} from './layout/announcement/announcement.component';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from './layout/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, AnnouncementComponent, RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Lucina';
}
