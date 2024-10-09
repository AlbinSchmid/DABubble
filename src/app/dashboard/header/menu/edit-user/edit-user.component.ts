import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthserviceService } from '../../../../landing-page/services/authservice.service';
import { UploadImageService } from '../../../../shared/services/upload-image.service';

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
      this.isOpenEditEditorChange.emit(this.isOpenEditEditor);
    }
  }

  changeEmail() {
    let emailUpdated = false;
  
    // Email update logic
    if (this.inputEmail && this.inputEmail.length > 0) {
      emailUpdated = true;
      this.authService.changeEmail(this.inputEmail).then(() => {
        this.successMessage = 'Eine Verifizierungs-E-Mail wurde gesendet. Bitte überprüfe deine E-Mails.';
        this.errorMessage = null;
      }).catch((error) => {
        this.errorMessage = error.message;
        this.successMessage = null;
      });
    }
  
    if (this.avatarChanged && this.imgUpload.selectedFile) {
      this.imgUpload.uploadUserAvatar(this.imgUpload.selectedFile).then((downloadUrl) => {
        this.newAvatar = downloadUrl;
        return this.imgUpload.updateUserAvatar(this.newAvatar);
      }).then(() => {
        this.authService.firebaseAuth.currentUser?.reload().then(() => {
          const currentUser = this.authService.currentUserSig();
          if (currentUser) {
            currentUser.avatar = this.newAvatar; 
            console.log('Avatar updated and UI refreshed');
          }
        });
      }).catch(error => {
        console.error('Error updating avatar:', error);
      });
    }
  }
}