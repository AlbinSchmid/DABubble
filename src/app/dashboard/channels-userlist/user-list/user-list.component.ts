import { Component, inject } from '@angular/core';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

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


  isDirectMessagesOpen: boolean = false;
  isCloseDirectMessagesSection: boolean = false;
  isDirectMessagesButtonDisable: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.firestoreService.startSnapshot('users');
    this.firestoreService.startSnapshot('channels');
  }

  ngOnDestroy(): void {
    this.firestoreService.stopSnapshot();
  }

  ngAfterViewInit() {
    setTimeout(() => this.isDirectMessagesOpen = true, this.isChannelsFinishedLoading());
  }

  isChannelsFinishedLoading(): number {
    let time = (this.firestoreService.channelList.length * 140) + 1500;
    return time;
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
      let totalButtons = this.firestoreService.userList.length;
      return (totalButtons - index - 1) * 0.10;
    }
  }

  arrayTimerDM(): number {
    return (this.firestoreService.userList.length * 100) + 50;
  }




}
