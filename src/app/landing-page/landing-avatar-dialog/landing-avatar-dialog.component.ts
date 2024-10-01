import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, OutputEmitterRef } from '@angular/core';
import { LogoComponent } from '../landing-shared/logo/logo.component';
import { LinksComponent } from "../landing-shared/links/links.component";
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { AuthserviceService } from '../services/authservice.service';
import { updateProfile } from '@firebase/auth';

@Component({
  selector: 'app-landing-avatar-dialog',
  standalone: true,
  imports: [CommonModule, LogoComponent, LinksComponent, MatIcon,
    MatIconModule, RouterLink, RouterLinkActive, MatButton, MatButtonModule,],
  templateUrl: './landing-avatar-dialog.component.html',
  styleUrl: './landing-avatar-dialog.component.scss'
})
export class LandingAvatarDialogComponent {
   avatars = [0, 1, 2, 3, 4, 5];
   defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a';
   selectedAvatar = this.defaultAvatar;
   showSuccessMessage = false;
   authService = inject(AuthserviceService)
   constructor(private router: Router,) {}
 
   
   isAvatarSelected(): boolean {
     return this.selectedAvatar !== this.defaultAvatar; 
   }
 
   onContinue() {
     if (this.isAvatarSelected()) {
       this.showSuccessMessage = true;
       setTimeout(() => {
         this.showSuccessMessage = false; 
         this.router.navigate(['/']);
       }, 2000);
     }
   }

   onSelectAvatar(avatar: number) {
    this.selectedAvatar = `https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar${avatar}.png?alt=media&token=69cc34c3-6640-4677-822e-ea9e2a9e2208`;
    const currentUser = this.authService.firebaseAuth.currentUser;
    
    if (currentUser) {
      updateProfile(currentUser, { photoURL: this.selectedAvatar }).then(() => {
        console.log('Avatar updated successfully');
      }).catch((error) => {
        console.error('Error updating avatar:', error);
      });
    }
  }
}

