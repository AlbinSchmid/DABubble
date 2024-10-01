import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthserviceService } from '../services/authservice.service';
import { UserInterface } from '../interfaces/userinterface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-test-user-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-test-user-dialog.component.html',
  styleUrl: './landing-test-user-dialog.component.scss'
})
export class LandingTestUserDialogComponent implements OnInit {
  authService = inject(AuthserviceService)

  ngOnInit(): void {
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.authService.currentUserSig.set({
          email: user.email,
          username: user.displayName,
          avatar: user.photoURL  
        });
      } else {
        this.authService.setCurrentUser(null);
      }
  
      console.log('Current User Signature:', this.authService.currentUserSig());
    });
  }
}