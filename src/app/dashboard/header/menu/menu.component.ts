import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { UploadImageService } from '../../../shared/services/upload-image.service';
import { Firestore } from '@angular/fire/firestore';
import { doc, updateDoc } from '@firebase/firestore';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { ThreadService } from '../../../shared/services/thread-service/thread.service';
import { ViewportService } from '../../../shared/services/viewport.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterLink,
    EditUserComponent
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  @Input() userStatus: string = 'on';
  @Output() userStatusChange = new EventEmitter<string>();

  @Input() isProfileMenuOpen: boolean = false;
  @Output() isProfileMenuOpenChange = new EventEmitter<boolean>();

  @Input() isUnderMenuOpen: boolean = false;
  @Output() isUnderMenuOpenChange = new EventEmitter<boolean>();

  @Input() isOpenEditEditor: boolean = false;
  @Output() isOpenEditEditorChange = new EventEmitter<boolean>();

  @Input() avatarUrl: string

  @ViewChild(EditUserComponent) editUserComponent!: EditUserComponent;

  authService: AuthserviceService = inject(AuthserviceService);
  imgUpload: UploadImageService = inject(UploadImageService);
  firestore: Firestore = inject(Firestore);
  messengerService: MessengerService = inject(MessengerService);
  threadService: ThreadService = inject(ThreadService);
  viewportService: ViewportService = inject(ViewportService);

  constructor() { }
  /**
   * Closes the thread and messenger components by setting their respective
   * 'show' properties to false.
   */
  closeThreadAndMessenger() {
    this.messengerService.showMessenger = false;
    this.threadService.showThread = false;
  }

  /**
   * Toggles the visibility of the profile menu.
   * 
   * If the profile menu is not open, it sets `isProfileMenuOpen` to true 
   * and emits the change. If the menu is already open, it closes the menu 
   * by invoking `closeMenu`, waits for 140ms, and then sets 
   * `isProfileMenuOpen` to false and emits the change.
   * 
   * @param e The event that triggered the toggle action.
   */
  toggleProfileMenu(e: Event): void {
    e.stopPropagation();
    if (!this.isProfileMenuOpen) {
      this.isProfileMenuOpen = true;
      this.isProfileMenuOpenChange.emit(this.isProfileMenuOpen);
    } else {
      let menuElement = document.querySelector('.profile-menu-contain');
      if (menuElement) {
        this.closeMenu(menuElement);
        setTimeout(() => {
          this.isProfileMenuOpen = false;
          this.isProfileMenuOpenChange.emit(this.isProfileMenuOpen);
        }, 140);
      }
    }
  }

  /**
   * Closes the profile menu by removing the 'open' and 'min-height' classes and
   * adding the 'close' class to the menu element.
   * @param menuElement The element that contains the profile menu.
   */
  closeMenu(menuElement: any) {
    menuElement.classList.remove('open');
    menuElement.classList.remove('min-height');
    menuElement.classList.add('close');
  }

  /**
   * Toggles the visibility of the under menu.
   * 
   * If the under menu is not open, it sets `isUnderMenuOpen` to true and
   * emits the change. If the under menu is already open, it closes the under
   * menu by setting `isUnderMenuOpen` to false and emitting the change.
   * @param e The event that triggered the toggle action.
   */
  openUnderMenuStatus(e: Event): void {
    e.stopPropagation();
    this.isUnderMenuOpen = !this.isUnderMenuOpen;
    this.isUnderMenuOpenChange.emit(this.isUnderMenuOpen);
  }

  /**
   * Returns true if the user is online, and false otherwise.
   * A user is considered online if their status is not set to 'off' or 'busy'.
   * @returns True if the user is online, false otherwise.
   */
  userIsOnline() {
    return this.userStatus !== 'off' && this.userStatus !== 'busy';
  }

  /**
   * Returns true if the user is offline, and false otherwise.
   * A user is considered offline if their status is set to 'off' but not 'busy'.
   * @returns True if the user is offline, false otherwise.
   */
  userIsOffline() {
    return this.userStatus !== 'on' && this.userStatus !== 'busy';
  }

  /**
   * Returns true if the user is busy, and false otherwise.
   * A user is considered busy if their status is set to 'busy' but not 'off'.
   * @returns True if the user is busy, false otherwise.
   */
  userIsBusy() {
    return this.userStatus !== 'off' && this.userStatus !== 'on';
  }

  /**
   * Sets the user status to the given value and closes the under menu by
   * setting `isUnderMenuOpen` to false. It also emits a change event for both
   * `userStatus` and `isUnderMenuOpen` properties.
   * @param e The event that triggered the status change.
   * @param status The new status of the user. Must be one of 'on', 'off', or 'busy'.
   */
  setUserStatus(e: Event, status: 'on' | 'off' | 'busy') {
    e.stopPropagation();
    this.userStatus = status;
    this.isUnderMenuOpen = false;
    this.userStatusChange.emit(this.userStatus);
    this.isUnderMenuOpenChange.emit(this.isUnderMenuOpen);
    this.updateUserStatus()
  }

  /**
   * Toggles the open state of the edit user editor. If the edit user editor is
   * not open, it will be opened by adding the class 'min-height' to the
   * element with the class 'profile-menu-contain'. If the edit user editor is
   * open, it will be closed by removing the same class. The open state of the
   * edit user editor is also emitted as a change event for the
   * `isOpenEditEditor` property.
   * @param e The event that triggered the toggle.
   */
  toggleEditUserEditor(e: Event) {
    e.stopPropagation();
    let menuElement = document.querySelector('.profile-menu-contain');
    if (menuElement && !this.isOpenEditEditor) {
      menuElement.classList.add('min-height');
      this.isOpenEditEditor = !this.isOpenEditEditor;
      this.isOpenEditEditorChange.emit(this.isOpenEditEditor);
    } else {
      if (menuElement) {
        menuElement.classList.remove('min-height');
        this.isOpenEditEditor = !this.isOpenEditEditor;
        this.isOpenEditEditorChange.emit(this.isOpenEditEditor);
      }
    }
  }

  /**
   * Stops the propagation of the given event. This function is called
   * for events that should not be propagated to the parent components.
   * @param e The event to stop propagating.
   */
  noClickable(e: Event) {
    e.stopPropagation();
  }

  /**
   * Updates the current user's status in Firestore with the current value of `userStatus`.
   * If a user is logged in, the user's document in Firestore is updated with the new status.
   * Logs an error if the update fails or if no user is found.
   */
  updateUserStatus() {
    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      const userDocRef = doc(this.firestore, `users/${currentUser.userID}`);
      updateDoc(userDocRef, { userStatus: this.userStatus })
        .catch((error) => {
          console.error('Error updating user status in Firestore:', error);
        });
    } else {
      console.error('No user found to update status');
    }
  }

  /**
   * Cancels the current editing process if the edit user component exists.
   * It calls the `cancelProcess` method from the `EditUserComponent` to
   * restore the original state and close the edit user editor.
   */
  onCancelProgress() {
    if (this.editUserComponent) {
      this.editUserComponent.cancelProcess(); // Call the method from the child
    }
  }
}
