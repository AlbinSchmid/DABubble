import { Component, inject, OnInit } from '@angular/core';
import { AuthserviceService } from '../services/authservice.service';
import { UserInterface } from '../interfaces/userinterface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-test-user-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-test-user-dialog.component.html',
  styleUrls: ['./landing-test-user-dialog.component.scss']
})
export class LandingTestUserDialogComponent implements OnInit {
  authService = inject(AuthserviceService);
  avatarUrl: string | undefined;

  ngOnInit(): void {
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        const newUser: UserInterface = {
          password: '',
          email: user.email,
          username: user.displayName,
          avatar: user.photoURL
        };

        this.authService.currentUserSig.set(newUser);
        this.avatarUrl = newUser.avatar; 

        console.log('Current User Signature:', this.authService.currentUserSig());
        console.log('Avatar URL:', this.avatarUrl);
      } else {
        this.authService.setCurrentUser(null);
      }
    });
  }
  onImageError() {
    console.error('Image failed to load. Current Avatar URL:', this.avatarUrl);
    this.avatarUrl = 'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a'; 
  }
}