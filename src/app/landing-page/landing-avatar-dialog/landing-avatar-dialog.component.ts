import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OutputEmitterRef } from '@angular/core';
import { LogoComponent } from '../landing-shared/logo/logo.component';
import { LinksComponent } from "../landing-shared/links/links.component";
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButton, MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-landing-avatar-dialog',
  standalone: true,
  imports: [CommonModule, LogoComponent, LinksComponent, MatIcon,
    MatIconModule, RouterLink, RouterLinkActive, MatButton, MatButtonModule,],
  templateUrl: './landing-avatar-dialog.component.html',
  styleUrl: './landing-avatar-dialog.component.scss'
})
export class LandingAvatarDialogComponent {
  
  constructor(private router: Router) { }
  avatars = [0, 1, 2, 3, 4, 5];
  defaultAvatar = 'assets/img/landing/avatar/avatar-clean.png';
  selectedAvatar = this.defaultAvatar;
  showSuccessMessage = false;

  onSelectAvatar(avatar: number) {
    this.selectedAvatar = `assets/img/landing/avatar/avatar${avatar}.png`; 
  }
  
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
}

