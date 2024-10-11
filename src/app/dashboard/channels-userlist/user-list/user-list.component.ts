import { Component, inject } from '@angular/core';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { user } from '@angular/fire/auth';
import { ThreadService } from '../../../shared/services/thread.service';

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

  userList: UserInterface[] = [];
  userListSubscription!: Subscription;


  isDirectMessagesOpen: boolean = false;
  isCloseDirectMessagesSection: boolean = false;
  isDirectMessagesButtonDisable: boolean = false;

  constructor(public threadService: ThreadService) { }

  ngOnInit(): void {
    this.firestoreService.startSnapshot('users');
    this.firestoreService.startSnapshot('channels');

    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      this.userList = users;
    });
  }

  ngOnDestroy(): void {
    this.firestoreService.stopSnapshot();
    if (this.userListSubscription) {
      this.userListSubscription.unsubscribe();
    }
  }

  // ngAfterViewInit() {
  //   setTimeout(() => this.toggleDirectMessages(), 1000);
  // }

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
      return (totalButtons - index - 1) * 0.10;
    }
  }

  arrayTimerDM(): number {
    return (this.userList.length * 100) + 50;
  }

  getDMMaxHeight(): number {
    return this.userList.length * 60 + 50;
  }

  getDMTransitionDuration(): string {
    let duration = this.userList.length * 0.60;
    return `max-height ${duration}s ease-in-out`;
  }

  showMessenger(userID: string) {
    console.log(userID);
    this.threadService.showMessenger = false;
    this.threadService.userId = userID;
    setTimeout(() => {
      this.threadService.showMessenger = true;
    }, 10);
  }
}
