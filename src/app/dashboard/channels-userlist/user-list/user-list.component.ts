import { Component, inject } from '@angular/core';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Channel } from '../../../shared/interfaces/channel';
import { ThreadService } from '../../../shared/services/thread-service/thread.service';
import { FirebaseMessengerService } from '../../../shared/services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {

  firestoreService: FirestoreService = inject(FirestoreService);
  authService: AuthserviceService = inject(AuthserviceService);

  userList: UserInterface[] = [];
  userListSubscription!: Subscription;

  channelList: Channel[] = [];
  channelListSubscription!: Subscription;


  isDirectMessagesOpen: boolean = false;
  isCloseDirectMessagesSection: boolean = false;
  isDirectMessagesButtonDisable: boolean = false;

  constructor(private threadService: ThreadService, private firebaseMessenger: FirebaseMessengerService, public messengerService: MessengerService) { }


  showMessenger(user: any) {
    this.threadService.showThreadSideNav = false;
    this.messengerService.chartId = '';
    this.messengerService.showMessenger = false;
    this.threadService.showThread = false;
    this.messengerService.openChannel = false;
    this.messengerService.openChart = true;
    this.messengerService.user = user;
    this.messengerService.channel;
    this.firebaseMessenger.searchChat(user);
  }

  ngOnInit(): void {
    this.firestoreService.startSnapshot('users');
    this.firestoreService.startSnapshot('channels');

    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      this.userList = users;
    });

    this.channelListSubscription = this.firestoreService.channelList$.subscribe(channels => {
      this.channelList = channels;
    });
  }

  ngOnDestroy(): void {
    this.firestoreService.stopSnapshot();
    if (this.userListSubscription) {
      this.userListSubscription.unsubscribe();
    }
  }

  toggleDirectMessages() {
    if (this.isDirectMessagesButtonDisable) return;

    this.isDirectMessagesButtonDisable = true;
    this.isDirectMessagesOpen = !this.isDirectMessagesOpen;

    if (!this.isDirectMessagesOpen) {
      this.isCloseDirectMessagesSection = true;
    }

    setTimeout(() => {
      this.isCloseDirectMessagesSection = this.isDirectMessagesOpen;
      this.isDirectMessagesButtonDisable = false;
    }, this.arrayTimerDM());

    this.updateTabArrow('#dmIcon');
  }

  updateTabArrow(id: string) {
    let icon = document.querySelector(id);
    if (icon && id == '#dmIcon') this.toggleDMIcon(icon);
  }

  toggleDMIcon(icon: Element) {
    icon.classList.toggle('rotate-down', this.isDirectMessagesOpen);
    icon.classList.toggle('rotate-right', !this.isDirectMessagesOpen);
  }

  getAnimationDelayDM(index: number): number {
    if (this.isDirectMessagesOpen) {
      return index * 0.10;
    } else {
      let totalButtons = this.userList.length;
      return (totalButtons - index - 1) * 0.1;
    }
  }

  arrayTimerDM(): number {
    return (this.userList.length * 150) + 50;
  }

  getDMMaxHeight(): number {
    return (this.userList.length * 100) + 50;
  }

  getDMTransitionDuration(): string {
    let duration = this.userList.length * 0.2;
    return `max-height ${duration}s ease-in-out`;
  }

  focusUser(user: UserInterface) {
    this.resetChannelFocus();
    this.userList.forEach(u => u.isFocus = false);
    this.firestoreService.setAndGetCurrentlyFocusedChat(user);
    user.isFocus = true;
  }

  resetChannelFocus(): void {
    this.channelList.forEach(channel => channel.isFocus = false);
  }
}
