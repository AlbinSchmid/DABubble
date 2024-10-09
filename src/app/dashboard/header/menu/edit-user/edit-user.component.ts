import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthserviceService } from '../../../../landing-page/services/authservice.service';
import { UploadImageService } from '../../../../shared/services/upload-image.service';
import { doc, setDoc } from '@angular/fire/firestore';
import { deleteObject, ref } from '@angular/fire/storage';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent implements OnInit{
  authService = inject(AuthserviceService)
  email: string = 'contact@rene-theis.de';
  inputName: string = '';
  inputEmail: string = '';
  errorMessage: string | null = null; 
  successMessage: string | null = null
  avatarChanged: boolean = false;
  imgUpload= inject(UploadImageService)
  newAvatar: string;

  standardAvatar = ['https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar0.png?alt=media&token=69cc34c3-6640-4677-822e-ea9e2a9e2208',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar1.png?alt=media&token=f8a95abe-d370-463b-b692-4f8ac6d4a3fd',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar2.png?alt=media&token=24c3fd24-6c63-4fda-a008-2645c5ea762e',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar3.png?alt=media&token=7a3e2c9e-4076-4a7b-9dd9-873657b2753d',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar4.png?alt=media&token=7a3e2c9e-4076-4a7b-9dd9-873657b2753d',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar5.png?alt=media&token=7a3e2c9e-4076-4a7b-9dd9-873657b2753d',
]
  

  @Input() isOpenEditEditor: boolean = false;

  @Output() isOpenEditEditorChange = new EventEmitter<boolean>();
  
  ngOnInit() {
    this.imgUpload.avatarChanged.subscribe((newAvatar) => {
      if (newAvatar) {
        this.avatarChanged = true;
        this.newAvatar = newAvatar; 
      }
    });
  }

  

  isEmailValid(): boolean {
    let emailPattern = /^[^<>@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(this.email);
  }

  cancelProcess() {
    let menuElement = document.querySelector('.profile-menu-contain');
    if (menuElement) {
      menuElement.classList.remove('min-height');
      this.isOpenEditEditor = false;
      this.isOpenEditEditorChange.emit(this.isOpenEditEditor = false);
    }
  }

  changeEmail() {
    if (this.inputEmail?.length > 0) {
      this.updateEmail();
    }
  
    if (this.avatarChanged && this.imgUpload.selectedFile) {
      this.updateAvatar();
    }
  }
  
  updateEmail() {
    this.authService.changeEmail(this.inputEmail).then(() => {
      this.successMessage = 'Eine Verifizierungs-E-Mail wurde gesendet. Bitte überprüfe deine E-Mails.';
      this.errorMessage = null;
    }).catch((error) => {
      this.errorMessage = error.message;
      this.successMessage = null;
    });
  }
  
  updateAvatar() {
    const currentUser = this.authService.currentUserSig();
    const oldAvatarUrl = currentUser?.avatar;
    if (this.imgUpload.selectedFile) {
      this.imgUpload.uploadUserAvatar(this.imgUpload.selectedFile).then((downloadUrl) => {
        this.newAvatar = downloadUrl;
        return this.imgUpload.updateUserAvatar(this.newAvatar);
      }).then(() => {
        this.handleOldAvatarDeletion(oldAvatarUrl);
      }).then(() => {
        this.reloadCurrentUser();
        this.cancelProcess()
      }).catch(error => {
        console.error('Error updating avatar:', error);
      });
    }
  }
  
  handleOldAvatarDeletion(oldAvatarUrl: string | undefined) {
    if (oldAvatarUrl && !this.standardAvatar.includes(oldAvatarUrl)) {
      const storageRef = ref(this.imgUpload.storage, oldAvatarUrl);
      deleteObject(storageRef).then(() => {
        console.warn('Old avatar deleted successfully');
      }).catch((error) => {
        console.error('Error deleting old avatar:', error);
      });
    } else {
      return;
    }
  }
  
  reloadCurrentUser() {
    const currentUser = this.authService.currentUserSig();
    this.authService.firebaseAuth.currentUser?.reload().then(() => {
      if (currentUser) {
        currentUser.avatar = this.newAvatar;
      }
    });
  }



}