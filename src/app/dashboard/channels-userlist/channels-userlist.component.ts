import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserListComponent } from './user-list/user-list.component';
import { ChannelListComponent } from './channel-list/channel-list.component';
import { MessengerService } from '../../shared/services/messenger-service/messenger.service';

@Component({
  selector: 'app-channels-userlist',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
    UserListComponent,
    ChannelListComponent
  ],
  templateUrl: './channels-userlist.component.html',
  styleUrls: ['./channels-userlist.component.scss']
})
export class ChannelsUserlistComponent {

  messengerService: MessengerService = inject(MessengerService);

  constructor() { }

}
