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

@Component({
  selector: 'app-landing-avatar-dialog',
  standalone: true,
  imports: [CommonModule, LogoComponent, LinksComponent, MatIconModule, RouterLink, RouterLinkActive, MatButtonModule],
  templateUrl: './landing-avatar-dialog.component.html',
  styleUrls: ['./landing-avatar-dialog.component.scss']
})
export class LandingAvatarDialogComponent {
   avatars = [0, 1, 2, 3, 4, 5];
   defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a';
   selectedAvatar = this.defaultAvatar;
   showSuccessMessage = false;
   authService = inject(AuthserviceService);
   storage = getStorage();
   selectedFile: File | null = null; 
   filePreview: string | ArrayBuffer | null = null; 
   tempUserData = this.authService.getTempUserData();
   constructor(private router: Router) {}

   isAvatarSelected(): boolean {
     return this.selectedAvatar !== this.defaultAvatar || !!this.filePreview;
   }

   async onContinue() {
    const tempUserData = this.authService.getTempUserData();
  
    if (tempUserData) {
      if (this.isAvatarSelected()) {
        if (this.selectedFile) {
          const compressedFile = await this.compressImage(this.selectedFile);
          const storageRef = ref(this.storage, `avatars/${compressedFile.name}`);
          await uploadBytes(storageRef, compressedFile);
          const avatarUrl = await getDownloadURL(storageRef);
          tempUserData.avatar = avatarUrl;
          
          await this.authService.register(tempUserData.email, tempUserData.username, tempUserData.password, tempUserData.avatar).toPromise();
        } else {
          tempUserData.avatar = this.selectedAvatar;
          await this.authService.register(tempUserData.email, tempUserData.username, tempUserData.password, tempUserData.avatar).toPromise();
        }
        
        this.authService.clearTempUserData();
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.router.navigate(['/']);
        }, 100000);
      } else {
        await this.authService.register(tempUserData.email, tempUserData.username, tempUserData.password, tempUserData.avatar).toPromise();
      }
    }
  }

   onSelectAvatar(avatar: number) {
     this.selectedAvatar = `https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar${avatar}.png?alt=media&token=69cc34c3-6640-4677-822e-ea9e2a9e2208`;
     this.filePreview = null; 
     this.selectedFile = null; 
   }

   onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file; 
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = e.target?.result ?? null; 
      };
      reader.readAsDataURL(file);
    }
  }

   async compressImage(file: File): Promise<File> {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.onload = (event) => {
         const img = new Image();
         img.onload = () => {
           const canvas = document.createElement('canvas');
           const ctx = canvas.getContext('2d');

           const maxWidth = 400;
           const maxHeight = 400;
           let width = img.width;
           let height = img.height;

           if (width > height) {
             if (width > maxWidth) {
               height *= maxWidth / width;
               width = maxWidth;
             }
           } else {
             if (height > maxHeight) {
               width *= maxHeight / height;
               height = maxHeight;
             }
           }

           canvas.width = width;
           canvas.height = height;
           ctx?.drawImage(img, 0, 0, width, height);
           canvas.toBlob((blob) => {
             if (blob) {
               const compressedFile = new File([blob], file.name, { type: file.type });
               resolve(compressedFile);
             } else {
               reject(new Error('Compression failed'));
             }
           }, file.type, 1); 
         };
         img.src = event.target?.result as string; 
       };
       reader.readAsDataURL(file);
     });
   }

   updateUserAvatar(avatarUrl: string) {
     const currentUser = this.authService.firebaseAuth.currentUser;
     if (currentUser) {
       updateProfile(currentUser, { photoURL: avatarUrl }).then(() => {
         console.log('Avatar updated successfully');
       }).catch(error => console.error('Error updating avatar:', error));
     }
   }
}

