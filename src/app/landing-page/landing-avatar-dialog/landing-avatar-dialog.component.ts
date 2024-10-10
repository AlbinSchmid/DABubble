import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LogoComponent } from '../landing-shared/logo/logo.component';
import { LinksComponent } from "../landing-shared/links/links.component";
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthserviceService } from '../services/authservice.service';
import { updateProfile } from '@firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';
import { UploadImageService } from '../../shared/services/upload-image.service';

@Component({
  selector: 'app-landing-avatar-dialog',
  standalone: true,
  imports: [CommonModule, LogoComponent, LinksComponent, MatIconModule, RouterLink, RouterLinkActive, MatButtonModule],
  templateUrl: './landing-avatar-dialog.component.html',
  styleUrls: ['./landing-avatar-dialog.component.scss']
})
export class LandingAvatarDialogComponent {
   avatars = [
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar0.png?alt=media&token=69cc34c3-6640-4677-822e-ea9e2a9e2208',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar1.png?alt=media&token=f8a95abe-d370-463b-b692-4f8ac6d4a3fd',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar2.png?alt=media&token=24c3fd24-6c63-4fda-a008-2645c5ea762e',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar3.png?alt=media&token=1c5f619a-6bf7-4578-a253-8dafff4fa373',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar4.png?alt=media&token=4bfb26e1-022b-4afb-b832-8bbf8b560729',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar5.png?alt=media&token=ed61b493-f9b5-434f-9613-bb6dc0609493',];
   defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a';
   selectedAvatar = this.defaultAvatar;
   showSuccessMessage = false;
   authService = inject(AuthserviceService);
   storage = getStorage();
   imgUpload = inject(UploadImageService) 
   tempUserData = this.authService.getTempUserData();
   constructor(private router: Router) {}

   isAvatarSelected(): boolean {
     return this.selectedAvatar !== this.defaultAvatar || !!this.imgUpload.filePreview;
   }

   async onContinue() {
    const tempUserData = this.authService.getTempUserData();
    
    if (tempUserData) {
      if (this.isAvatarSelected()) {
        try {
          if (this.imgUpload.selectedFile) {
            await this.imgUpload.saveAndSetUserAvatar(this.imgUpload.selectedFile, tempUserData);
          } else {
            tempUserData.avatar = this.selectedAvatar;
            await this.authService.register(tempUserData.email, tempUserData.username, tempUserData.password, tempUserData.avatar).toPromise();
          }
  
          this.authService.clearTempUserData();
          this.showSuccessMessage = true;
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.router.navigate(['/']);
          }, 2000);
  
        } catch (error) {
          console.error('Error during registration:', error);
        }
      } else {
        await this.authService.register(tempUserData.email, tempUserData.username, tempUserData.password, tempUserData.avatar).toPromise();
      }
    }
  }

   onSelectAvatar(avatar: string) {
    this.selectedAvatar = `${avatar}`;
    this.imgUpload.filePreview = null;
    this.imgUpload.selectedFile = null; 
   }



   updateUserAvatar(avatarUrl: string) {
   this.imgUpload.updateUserAvatar(avatarUrl)
}

}