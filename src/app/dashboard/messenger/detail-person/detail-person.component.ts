import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { CommonModule } from '@angular/common';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { FirebaseMessengerService } from '../../../shared/services/firebase-services/firebase-messenger.service';


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

  
/**
 * Checks the current user's status and returns a string representation.
 * 
 * @returns {string} - Returns 'Aktiv' if the user is online, 'Offline' if the user is offline,
 * and 'Beschäftigt' if the user is busy.
 */
  checkUserStatus():string {
    if (this.data.userStatus == 'on') {
      return 'Aktiv';
    } else if (this.data.userStatus == 'off') {
      return 'Offline'
    } else {
      return 'Beschäftigt'
    }
  }

  openUser() {
    this.messengerService.showAddPerson = false;
    this.dialog.closeAll();
    this.messengerService.showChart(this.data);
    this.firebaseMessenger.searchChat(this.data);
  }
}
