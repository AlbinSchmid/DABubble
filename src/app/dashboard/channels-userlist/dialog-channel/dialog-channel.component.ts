import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { AnimationServiceService } from '../channel-list/animation.service.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';

@Component({
  selector: 'app-dialog-channel',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './dialog-channel.component.html',
  styleUrl: './dialog-channel.component.scss'
})
export class DialogChannelComponent {

  firestoreService: FirestoreService = inject(FirestoreService);
  channelAnimationService: AnimationServiceService = inject(AnimationServiceService);
  authService: AuthserviceService = inject(AuthserviceService);
  dialogRef: MatDialogRef<DialogChannelComponent> = inject(MatDialogRef);

  data = inject(MAT_DIALOG_DATA);

  title: string = '';
  description: string;

  constructor() {
    if (this.data) {
      this.showDialogOfEditUser();
    } else {
      this.showDefaultDialog();
    }
  }

  showDialogOfEditUser() {
    this.title = this.data.title;
    this.description = this.data.description;
  }

  showDefaultDialog() {
    this.title = '';
    this.description = '';
  }

  closeDialog() {
    console.log(this.setChannelOnject());
  }

  setChannelOnject() {
    return {
      title: this.title,
      description: this.description,
      createdBy: this.authService.currentUserSig()!.username,
      isFocus: false,
      user: [],
      messages: []
    }
  }

  async addChannel() {
    try {
      if (this.channelAnimationService.isChannelOpen) this.channelAnimationService.toggleChannels();
      await new Promise(resolve => setTimeout(resolve, this.channelAnimationService.arrayTimerChannels() + 200));
      await this.firestoreService.addDoc(this.setChannelOnject(), 'channels');
      this.dialogRef.close();
      this.channelAnimationService.toggleChannels();
    } catch (error) {
      console.error("Failed to add the channel:", error);
    }
  }
}
