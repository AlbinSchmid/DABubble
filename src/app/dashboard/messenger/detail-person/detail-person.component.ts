import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { CommonModule } from '@angular/common';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';


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
  messengerService = inject(MessengerService)
  readonly dialogRef = inject(MatDialogRef<DetailPersonComponent>);
  public data: UserInterface = inject(MAT_DIALOG_DATA);

  
/**
 * Checks the current user's status and returns a string representation.
 * 
 * @returns {string} - Returns 'Aktiv' if the user is online, 'Offline' if the user is offline,
 * and 'Beschäftigt' if the user is busy.
 */
  checkUserStatus():string {
    if (this.messengerService.user.userStatus == 'on') {
      return 'Aktiv';
    } else if (this.messengerService.user.userStatus == 'off') {
      return 'Offline'
    } else {
      return 'Beschäftigt'
    }
  }
}
