import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { UploadImageService } from '../../../shared/services/upload-image.service';
import { Firestore } from '@angular/fire/firestore';
import { collection, doc, updateDoc } from '@firebase/firestore';

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

  @Input() avatarUrl:string
  


  authService = inject(AuthserviceService)
  imgUpload = inject(UploadImageService)
  firestore = inject(Firestore)

  toggleProfileMenu(e: Event): void {
    e.stopPropagation();

    if (!this.isProfileMenuOpen) {
      this.isProfileMenuOpen = true;
      this.isProfileMenuOpenChange.emit(this.isProfileMenuOpen);
    } else {
      let menuElement = document.querySelector('.profile-menu-contain');
      if (menuElement) {
        menuElement.classList.remove('open');
        menuElement.classList.remove('min-height');
        menuElement.classList.add('close');
        setTimeout(() => {
          this.isProfileMenuOpen = false;
          this.isProfileMenuOpenChange.emit(this.isProfileMenuOpen);
        }, 140);
      }
    }
  }

  openUnderMenuStatus(e: Event): void {
    e.stopPropagation();
    this.isUnderMenuOpen = !this.isUnderMenuOpen;
    this.isUnderMenuOpenChange.emit(this.isUnderMenuOpen);
  }

  userIsOnline() {
    return this.userStatus !== 'off' && this.userStatus !== 'busy';
  }

  userIsOffline() {
    return this.userStatus !== 'on' && this.userStatus !== 'busy';
  }

  userIsBusy() {
    return this.userStatus !== 'off' && this.userStatus !== 'on';
  }

  setUserStatus(e: Event, status: 'on' | 'off' | 'busy') {
    e.stopPropagation();
    this.userStatus = status;
    this.isUnderMenuOpen = false;
    this.userStatusChange.emit(this.userStatus);
    this.isUnderMenuOpenChange.emit(this.isUnderMenuOpen);
    this.updateUserStatus()
  }

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

  noClickable(e: Event) {
    e.stopPropagation();
  }

  updateUserStatus() {
    const currentUser = this.authService.currentUserSig(); 
    
    if (currentUser) {
      const userDocRef = doc(this.firestore, `users/${currentUser.userID}`);
      
      // Update the 'status' field in the user's Firestore document
      updateDoc(userDocRef, { userStatus: this.userStatus })
        .then(() => {
          console.log('User status updated successfully in Firestore');
        })
        .catch((error) => {
          console.error('Error updating user status in Firestore:', error);
        });
    } else {
      console.error('No user found to update status');
    }
  }
}
