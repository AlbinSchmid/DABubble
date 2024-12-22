import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Output, ViewChild, NgZone } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { Channel } from '../../../shared/interfaces/channel';
import { AnimationChannelService } from '../../channels-userlist/channel-list/animation.service.service';
import { ViewportService } from '../../../shared/services/viewport.service';
import { BrowserTypeOnTouchService } from '../../../shared/services/browser-type-on-touch.service';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    TextFieldModule
  ],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {
  @ViewChild('channelTitleInput') channelTitleInput: ElementRef;
  @ViewChild('channelDescriptionTextarea') channelDescriptionTextarea: ElementRef;
  @ViewChild(CdkTextareaAutosize) textareaAutosize!: CdkTextareaAutosize;

  @Output() closeOverlay = new EventEmitter<void>();

  ngZone: NgZone = inject(NgZone);

  browserTypeOnTouchService = inject(BrowserTypeOnTouchService);
  messengerService: MessengerService = inject(MessengerService);
  authService: AuthserviceService = inject(AuthserviceService);
  firestoreService: FirestoreService = inject(FirestoreService);
  channelAnimationService: AnimationChannelService = inject(AnimationChannelService);
  viewportService: ViewportService = inject(ViewportService);

  editTitle: boolean = false;
  editDescription: boolean = false;

  descriptionTxt: string = '';
  titleTxt: string = '';


  /**
   * Sets the initial values for the description and title of the channel
   * to the current description and title of the channel in the messenger service.
   */
  constructor() {
    this.descriptionTxt = this.messengerService.channel.description;
    this.titleTxt = this.messengerService.channel.title;
  }


  /**
   * Checks if the channel is the global channel.
   * @returns true if the channel is the global channel, false otherwise.
   */
  isGlobalChannel(): boolean {
    return this.titleTxt === 'Allgemein';
  }


  /**
   * Closes the dialog and emits an event to the parent component
   * to close the overlay.
   */
  closeDialog(): void {
    this.closeOverlay.emit();
  }


  /**
   * Toggles the edit mode for the channel title and description.
   * If the edit mode is turned off, it updates the title of the channel in the Firestore.
   * It also sets the focus to the title input field after a short delay.
   */
  editChannelTitle(): void {
    this.editTitle = !this.editTitle;
    if (!this.editTitle) {
      this.updateContent('title');
    }
    setTimeout(() => {
      this.channelTitleInput?.nativeElement.focus();
    }, 250);
  }


  /**
   * Toggles the edit mode for the channel description.
   * If the edit mode is turned off, it updates the description of the channel in the Firestore.
   * It also sets the focus to the description textarea after a short delay and scrolls to the bottom of the textarea.
   * If the edit mode is turned on, it blurs the textarea and scrolls it back to the top.
   */
  editChannelDescription(): void {
    let textarea = this.channelDescriptionTextarea?.nativeElement;
    this.editDescription = !this.editDescription;
    if (this.editDescription) {
      this.scrollToBottom(textarea);
    } else {
      this.updateContent('description');
      this.channelDescriptionTextarea?.nativeElement.blur();
      this.channelDescriptionTextarea.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }


  /**
   * Scrolls the textarea to the bottom and sets the focus to the textarea after a short delay.
   * This function is used to set the focus to the textarea after the edit mode for the channel description is turned on.
   * @param textarea - The textarea element to be scrolled and focused.
   */
  scrollToBottom(textarea: any): void {
    if (textarea) {
      textarea.scrollTo({ top: textarea.scrollHeight, behavior: 'smooth' });
      setTimeout(() => {
        textarea.focus();
      }, 300);
    }
  }


  /**
   * Removes the user with the ID of the current user from the userIDs of the channel in the messenger service.
   * If the user is the last member of the channel, it deletes the channel from the Firestore.
   * If the user is not the last member of the channel, it updates the channel in the Firestore.
   * Finally, it sets the openMessenger flag to false and toggles the animation of the channel list.
   */
  leaveTheChannel(): void {
    let currentUserId = this.authService.currentUserSig()?.userID;
    let editChannelID = this.messengerService.channel.channelID!;
    this.messengerService.openMessenger = false;
    if (currentUserId) {
      this.messengerService.channel.userIDs = this.messengerService.channel.userIDs.filter(id => id !== currentUserId);
      this.checkIfLastUserLeavedChannel(editChannelID);
    }
  }


  /**
   * Asynchronously updates or deletes a channel in Firestore based on the number of its users.
   * If the channel has no users left, it deletes the channel document and updates the list of channels.
   * If the channel still has users, it updates the channel document with the current user IDs.
   * In both cases, the channel animation is toggled after the operation.
   * @param editChannelID - The ID of the channel to be updated or deleted.
   * @returns A Promise that resolves when the operation is complete.
   */
  async checkIfLastUserLeavedChannel(editChannelID: string): Promise<void> {
    if (this.messengerService.channel.userIDs.length === 0) {
      await this.channelAnimationService.updateListOfChannels();
      await this.firestoreService.deleteDoc('channels', editChannelID);
      this.channelAnimationService.toggleChannels();
    } else {
      await this.channelAnimationService.updateListOfChannels();
      await this.firestoreService.updateDoc('channels', editChannelID, { userIDs: this.messengerService.channel.userIDs });
      this.channelAnimationService.toggleChannels();
    }
  }

  
  /**
   * Closes the dialog and sets the global channel as the currently focused channel.
   * It also toggles the animation of the channel list.
   */
  closeDialogAndHopToGlobalChannel():void {
    this.closeDialog();
    let globalChannel = this.firestoreService.channelList$.value.find(channel => channel.title === 'Allgemein');
    globalChannel!.isFocus = true;
    this.messengerService.channel = globalChannel as Channel;
    this.channelAnimationService.toggleChannels();
  }

  
  /**
   * Updates the Firestore document of the currently focused channel based on the content parameter.
   * If content is 'title', it updates the title of the channel using the updateTitle function.
   * If content is 'description', it updates the description of the channel in Firestore and sets the new description in the channel object in the messenger service.
   * @param content - A string indicating whether to update the title or description of the channel.
   * @returns A Promise that resolves when the operation is complete.
   */
  async updateContent(content: string): Promise<void> {
    let editChannelID = this.messengerService.channel.channelID;
    if (content == 'title') {
      this.updateTitle(editChannelID);
    } else if (content == 'description') {
      await this.firestoreService.updateDoc('channels', editChannelID!, { description: this.descriptionTxt });
      this.setNewChannelDescription(editChannelID!);
    }
  }


  /**
   * Updates the title of the channel with the given ID to the current text of the title input field.
   * @param editChannelID - The ID of the channel to be updated.
   * @returns A Promise that resolves when the operation is complete.
   */
  async updateTitle(editChannelID: string | undefined): Promise<void> {
    if (this.channelTitleInput?.nativeElement && this.channelTitleInput.nativeElement.value.length !== 0) {
      this.titleTxt = this.channelTitleInput.nativeElement.value;
      await this.firestoreService.updateDoc('channels', editChannelID!, { title: this.channelTitleInput.nativeElement.value });
      this.setNewChannelTitle(editChannelID!);
    } else {
      return
    }
  }


  /**
   * Updates the title of the currently focused channel in the messenger service.
   * It fetches the new title from Firestore and updates the title of the channel in the messenger service.
   * @param editChannelID - The ID of the channel to be updated.
   * @returns A Promise that resolves when the operation is complete.
   */
  async setNewChannelTitle(editChannelID: string):Promise<void> {
    let obj = await this.firestoreService.getObjectById('channels', editChannelID);
    this.messengerService.channel.title = obj!["title"];
  }


  /**
   * Updates the description of the currently focused channel in the messenger service.
   * It fetches the new description from Firestore and updates the description of the channel in the messenger service.
   * @param editChannelID - The ID of the channel to be updated.
   * @returns A Promise that resolves when the operation is complete.
   */
  async setNewChannelDescription(editChannelID: string): Promise<void> {
    let obj = await this.firestoreService.getObjectById('channels', editChannelID);
    this.messengerService.channel.description = obj!["description"];
  }
}
