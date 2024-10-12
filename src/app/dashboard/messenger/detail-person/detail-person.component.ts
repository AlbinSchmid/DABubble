import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-detail-person',
  standalone: true,
  imports: [
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './detail-person.component.html',
  styleUrl: './detail-person.component.scss'
})
export class DetailPersonComponent {
  readonly dialogRef = inject(MatDialogRef<DetailPersonComponent>);


  constructor(public messengerService: MessengerService) {
    
  }
  
  
  closeDialog() {
    this.dialogRef.close();
  }
  
  
  checkUserStatus() {
    if (this.messengerService.user.userStatus == 'on') {
      return 'Aktiv';
    } else if (this.messengerService.user.userStatus == 'off') {
      return 'Offline'
    } else {
      return 'Beschäftigt'
    }
  }

}
