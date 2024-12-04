import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { CommonModule } from '@angular/common';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { FirebaseMessengerService } from '../../../shared/services/firebase-services/firebase-messenger.service';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { UserListHandlingService } from '../../channels-userlist/user-list/user-list-handling.service';


@Component({
  selector: 'app-detail-person',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './detail-person.component.html',
  styleUrl: './detail-person.component.scss'
})
export class DetailPersonComponent {
  messengerService = inject(MessengerService);
  firebaseMessenger = inject(FirebaseMessengerService);
  dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<DetailPersonComponent>);

  data: UserInterface = inject(MAT_DIALOG_DATA);
  firestoreService: FirestoreService = inject(FirestoreService);
  userListHandlingService: UserListHandlingService = inject(UserListHandlingService);


  /**
   * Checks the current user's status and returns a string representation.
   * 
   * @returns {string} - Returns 'Aktiv' if the user is online, 'Offline' if the user is offline,
   * and 'Beschäftigt' if the user is busy.
   */
  checkUserStatus(): string {
    if (this.data.userStatus == 'on') {
      return 'Aktiv';
    } else if (this.data.userStatus == 'off') {
      return 'Offline'
    } else {
      return 'Beschäftigt'
    }
  }

  openUser(user: UserInterface) {
    this.messengerService.showAddPerson = false;
    this.dialog.closeAll();
    this.messengerService.showChart(this.data);
    this.firebaseMessenger.searchChat(this.data);
    this.focusUser(user);
  }

  focusUser(user: UserInterface) {
    this.resetChannelFocus();
    this.firestoreService.userList.forEach(u => u.isFocus = false);
    this.firestoreService.setAndGetCurrentlyFocusedChat(user);
    this.firebaseMessenger.content = '';
    this.firebaseMessenger.answerContent = '';
    this.firebaseMessenger.searchChat(user);
    this.messengerService.showChart(user);
    this.setFocus(user);
  }

  setFocus(user: UserInterface) {
    let foundUser = this.firestoreService.userList.find(u => u.userID === user.userID);
    if (foundUser) {
      foundUser.isFocus = true;
      this.userListHandlingService.focusedUserId = foundUser.userID;
    }
  }

  resetChannelFocus(): void {
    this.firestoreService.channelList.forEach(channel => channel.isFocus = false);
  }
}
