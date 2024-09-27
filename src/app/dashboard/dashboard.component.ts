import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { ChannelsUserlistComponent } from './channels-userlist/channels-userlist.component';
import { MessengerComponent } from './messenger/messenger.component';
import { ThreadComponent } from './thread/thread.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HeaderComponent,
    ChannelsUserlistComponent,
    MessengerComponent,
    ThreadComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
