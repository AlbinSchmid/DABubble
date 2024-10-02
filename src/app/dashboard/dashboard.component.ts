import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { ChannelsUserlistComponent } from './channels-userlist/channels-userlist.component';
import { MessengerComponent } from './messenger/messenger.component';
import { ThreadComponent } from './thread/thread.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HeaderComponent,
    ChannelsUserlistComponent,
    MessengerComponent,
    ThreadComponent,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
