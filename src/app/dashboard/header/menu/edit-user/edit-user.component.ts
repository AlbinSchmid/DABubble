import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthserviceService } from '../../../../landing-page/services/authservice.service';
import { UploadImageService } from '../../../../shared/services/upload-image.service';
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
  inputName: string = '';
  inputEmail: string = '';
  errorMessage: string | null = null; 
  successMessage: string | null = null
  avatarChanged: boolean = false;
  imgUpload= inject(UploadImageService)
  newAvatar: string;
  originalAvatar: string;
  inputPassword: string = '';
  sending: boolean = false;

  standardAvatar = ['https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar0.png?alt=media&token=69cc34c3-6640-4677-822e-ea9e2a9e2208',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar1.png?alt=media&token=f8a95abe-d370-463b-b692-4f8ac6d4a3fd',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar2.png?alt=media&token=24c3fd24-6c63-4fda-a008-2645c5ea762e',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar3.png?alt=media&token=1c5f619a-6bf7-4578-a253-8dafff4fa373',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar4.png?alt=media&token=4bfb26e1-022b-4afb-b832-8bbf8b560729',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar5.png?alt=media&token=ed61b493-f9b5-434f-9613-bb6dc0609493',
]
  

  @Input() isOpenEditEditor: boolean = false;
  @Output() isOpenEditEditorChange = new EventEmitter<boolean>();
  
  ngOnInit() {
    this.setInitialValues();
    this.imgUpload.avatarChanged.subscribe((newAvatar) => {
      if (newAvatar) {
        this.avatarChanged = true;
        this.newAvatar = newAvatar; 
      }
    });
    const currentUser = this.authService.currentUserSig();
    if (currentUser?.avatar) {
      this.originalAvatar = currentUser.avatar; 
    }
  }

  
  
  setInitialValues() {
    this.inputName =  '';
    this.inputEmail =  '';
    this.inputPassword = ''; 
  }
  

  isEmailValid(): boolean {
    let emailPattern = /^[^<>@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.inputEmail)) {
      this.errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      this.setInitialValues()
      return false;
    } else {
      this.errorMessage = null; 
      return true;
    }
  }

isNameValid(): boolean {
  let namePattern = /^[a-zA-Z]{1,}\s[a-zA-Z]{1,}$/;
  if (!namePattern.test(this.inputName)) {
    this.errorMessage = 'Bitte geben Sie Ihren Vornamen und Nachnamen ein.';
    this.setInitialValues();
    return false;
  } else {
    this.errorMessage = null; 
    return true;
  }
}

isPasswordValid(): boolean {
  let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordPattern.test(this.inputPassword)) {
    this.errorMessage = 'Das Passwort stimmt nicht mit Ihren Anmeldedaten überein';
    this.setInitialValues();
    return false;   
  } else if( this.inputEmail == this.authService.currentUserSig()?.email) {
    this.errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
    this.setInitialValues();
    return false;
  }else{
    this.errorMessage = null;
    return true;
  }
}

  cancelProcess() {
    let menuElement = document.querySelector('.profile-menu-contain');
    if (menuElement) {
      menuElement.classList.remove('min-height');
    }
    this.newAvatar = this.originalAvatar;
    this.imgUpload.filePreview = null; 
    this.isOpenEditEditor = false;
    this.isOpenEditEditorChange.emit(this.isOpenEditEditor = false);
    this.reloadCurrentUser();
  }

  changeEmail() {
    const currentUser = this.authService.currentUserSig();
    if (this.inputEmail) {
      if (!this.isEmailValid() || !this.isPasswordValid() || this.inputEmail == this.authService.currentUserSig()?.email) {
        return; 
      } else {
        this.sending = true;
        this.updateEmail()
        
          .then(() => {
            this.successMessage = 'E-Mail-Adresse erfolgreich aktualisiert.';
            this.timeoutCLose()
            
          })
          .catch((error) => {
            this.errorMessage = this.handleAuthError(error);
            console.error('Error updating email: from updateEmail user component', error);
          });
      }
    }
    
    if (this.inputName && this.inputName !== currentUser?.username) {
      if (!this.isNameValid()) {
        return; 
      } else {
        this.updateName();
        this.successMessage = 'Name erfolgreich aktualisiert.';
        this.timeoutCLose()
      }
    }
  
    if (this.avatarChanged && this.imgUpload.selectedFile) {
      this.sending = true;
      this.updateAvatar();
      this.successMessage = 'Avatar erfolgreich aktualisiert.';
      this.timeoutCLose()
    }
  }

  timeoutCLose(){
    setTimeout(() => {
      this.cancelProcess();
      this.sending = false;
    }, 2000);
  }
  
  async updateEmail(): Promise<void> {
    if (!this.isEmailValid() || !this.isPasswordValid()) {
      throw new Error('Validation failed for email or password.'); 
    }
    await this.authService.updateEmail(this.inputEmail, this.inputPassword);
  }


  handleAuthError(error: any) {
    let errorMessage = 'Ein unbekannter Fehler ist aufgetreten.';
  
    if (error.code) {
      console.log('Fehlercode:', error.code);
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Die eingegebene E-Mail-Adresse ist ungültig.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Es konnte kein Benutzer mit diesen Anmeldedaten gefunden werden.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Das Passwort ist falsch. Bitte erneut eingeben.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Das Passwort ist zu schwach. Bitte wählen Sie ein stärkeres Passwort.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Für diese Aktion müssen Sie sich erneut anmelden.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.';
          break;
        default:
          errorMessage = 'Ein Fehler ist aufgetreten: ' + error.message;
          break;
      }
    }
  
    return errorMessage; 
  }

  updateName() {
    if (this.inputName?.length > 0) {
      try {
        this.authService.updateName(this.inputName);
      } catch (error) {
        console.error('Error updating name:', error);
      }
    }
  }

 
  
  async updateAvatar() {
    const currentUser = this.authService.currentUserSig();  
    const oldAvatarUrl = currentUser?.avatar;
    if (this.imgUpload.selectedFile) {
      try {
        const downloadUrl = await this.imgUpload.uploadUserAvatar(this.imgUpload.selectedFile);
        this.newAvatar = downloadUrl;
        await this.imgUpload.updateUserAvatar(downloadUrl);
        await this.imgUpload.updateAvatarInFirestore(downloadUrl);
        this.handleOldAvatarDeletion(oldAvatarUrl);
        this.reloadCurrentUser();
        this.cancelProcess();
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
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

  onAvatarSelected(event: Event) {
    this.imgUpload.onFileSelected(event);
  }
}