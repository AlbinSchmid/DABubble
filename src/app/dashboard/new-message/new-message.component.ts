import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserInterface } from '../../landing-page/interfaces/userinterface';
import { Channel } from '../../shared/interfaces/channel';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { FirestoreService } from '../../shared/services/firebase-services/firestore.service';
import { Subscription } from 'rxjs';
import { UserFilteredListComponent } from './user-filtered-lists/user-filtered-list.component';
import { ChannelFilteredListComponent } from './channel-filtered-list/channel-filtered-list.component';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [
    CommonModule,
    TextareaComponent,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    UserFilteredListComponent,
    ChannelFilteredListComponent
  ],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {

  authService: AuthserviceService = inject(AuthserviceService);
  firestoreService: FirestoreService = inject(FirestoreService);

  userList: UserInterface[] = [];
  userListSubscription!: Subscription;

  channelList: Channel[] = [];
  channelListSubscription!: Subscription;

  selectUser: UserInterface[] = [];
  selectChannels: Channel[] = [];

  filteredUsers: UserInterface[] = [];
  filteredChannels: Channel[] = [];

  highlightedIndex: number = -1;

  sourceThread: boolean = false;
  filterUsers: boolean = false;
  filterChannels: boolean = false;

  constructor() { }


  ngOnInit(): void {
    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      this.userList = users;
      this.filteredUsers = users;
    });

    this.channelListSubscription = this.firestoreService.channelList$.subscribe(channels => {
      this.channelList = channels;
      this.filteredChannels = channels;
    });
  }

  ngOnDestroy(): void {
    if (this.userListSubscription) {
      this.userListSubscription.unsubscribe();
    }

    if (this.channelListSubscription) {
      this.channelListSubscription.unsubscribe();
    }
  }

  onUserAdded(user: UserInterface): void {
    console.log(user);
  }

  onChannelAdded(channel: Channel): void {
    console.log(channel);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
    }
    if (this.filteredUsers.length > 0) {
      if (event.key === 'ArrowDown') {
        this.highlightedIndex = (this.highlightedIndex + 1) % this.filteredUsers.length;
        this.scrollToSelectedUser();
      } else if (event.key === 'ArrowUp') {
        this.highlightedIndex = (this.highlightedIndex - 1 + this.filteredUsers.length) % this.filteredUsers.length;
        this.scrollToSelectedUser();
      } else if (event.key === 'Enter' && this.highlightedIndex >= 0) {


        // HIER WIRD DANN DER AUSGEWÄHLTE CHANNEL ODER USER DANN ZUR JEWEILIGEN LISTE GEPUSHT        


      }
    }
  }

  scrollToSelectedUser(): void {
    let matCardContent = document.querySelector('mat-card-content') as HTMLElement;
    let selectedButton = matCardContent.querySelectorAll('button')[this.highlightedIndex] as HTMLElement;

    if (selectedButton) {
      selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }

  searchUserByName(event: Event): void {
    let inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.trim().toLowerCase();

    if (value === '@') {
      this.filterUsers = true;
      this.filterChannels = false;
    } else if (value === '#') {
      this.filterUsers = false;
      this.filterChannels = true;
    } else if (value === '') {
      this.filterUsers = false;
      this.filterChannels = false;
    } else {
      // user nach email filtern
    }
  }
}
