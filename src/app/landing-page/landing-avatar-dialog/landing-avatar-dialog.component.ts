import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OutputEmitterRef } from '@angular/core';
import { LogoComponent } from '../landing-shared/logo/logo.component';
import { LinksComponent } from "../landing-shared/links/links.component";
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { FormDataService } from '../services/form-data.service';

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
   defaultAvatar = 'assets/img/landing/avatar/avatar-clean.png';
   selectedAvatar = this.defaultAvatar;
   showSuccessMessage = false;
 
   constructor(private router: Router, private formDataService: FormDataService) {}
 
   onSelectAvatar(avatar: number) {
     this.selectedAvatar = `assets/img/landing/avatar/avatar${avatar}.png`; 
     this.formDataService.updateAvatar(this.selectedAvatar); 
   }
   
   isAvatarSelected(): boolean {
     return this.selectedAvatar !== this.defaultAvatar; 
   }
 
   onContinue() {
     if (this.isAvatarSelected()) {
       this.showSuccessMessage = true;
       this.formDataService.currentFormData.subscribe(formData => {
        console.log('Current Form Data in Avatar Component:', formData);
      });
       setTimeout(() => {
         this.showSuccessMessage = false; 
         this.router.navigate(['/']);
       }, 2000);
     }
   }
}

