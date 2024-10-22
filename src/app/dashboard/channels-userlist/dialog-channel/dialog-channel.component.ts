import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleDescriptionComponent } from './title-description/title-description.component';
import { AddMembersComponent } from './add-members/add-members.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { AnimationChannelService } from '../channel-list/animation.service.service';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { MatIconModule } from '@angular/material/icon';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';

@Component({
  selector: 'app-dialog-channel',
  standalone: true,
  imports: [
    CommonModule,
    TitleDescriptionComponent,
    AddMembersComponent,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './dialog-channel.component.html',
  styleUrl: './dialog-channel.component.scss'
})
export class DialogChannelComponent {

  firestoreService: FirestoreService = inject(FirestoreService);
  authService: AuthserviceService = inject(AuthserviceService);
  channelAnimationService: AnimationChannelService = inject(AnimationChannelService);
  dialogRef: MatDialogRef<DialogChannelComponent> = inject(MatDialogRef);

  showAddMembersDialog: boolean = false;
  selectInput: boolean = false;
  inputValueEmpty: boolean = true;

  title: string = '';
  description: string = '';
  members: UserInterface[] = [];


  constructor() { }

  updateMembers(newMembers: UserInterface[]): void {
    this.members = newMembers;
  }

  onTitleChanged(newTitle: string) {
    this.title = newTitle;
  }

  onDescriptionChanged(newDescription: string) {
    this.description = newDescription;
  }

  onSelectInputChanged(newSelect: boolean) {
    this.selectInput = newSelect;
  }

  inputValueChange(isEmpty: boolean) {
    this.inputValueEmpty = isEmpty;
  }

  getDialogClass(): string {
    let channels = this.channelAnimationService.channelList.length;
    if (!this.showAddMembersDialog) {
      return 'title-description-height';
    }
    if (channels === 1) {
      return 'add-member-height-fore-one';
    } else if (channels === 2) {
      return 'add-member-height-fore-two';
    } else if (channels >= 3) {
      return 'add-member-height-fore-more';
    }
    return 'add-member-height-fore-empty';
  }

  showAddMembers() {
    this.showAddMembersDialog = true;
  }

  close() {
    this.dialogRef.close();
  }

  setChannelOnject() {
    return {
      title: this.title,
      description: this.description,
      createdBy: this.authService.currentUserSig()!.username,
      isFocus: false,
      user: this.members,
      messages: []
    }
  }

  async addChannel() {
    try {
      this.dialogRef.close();
      if (this.channelAnimationService.isChannelOpen) this.channelAnimationService.toggleChannels();
      await new Promise(resolve => setTimeout(resolve, this.channelAnimationService.arrayTimerChannels() + 200));
      await this.firestoreService.addDoc(this.setChannelOnject(), 'channels');

      this.channelAnimationService.toggleChannels();
    } catch (error) {
      console.error("Failed to add the channel:", error);
    }
  }
}
