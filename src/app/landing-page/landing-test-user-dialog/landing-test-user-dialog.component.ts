import { Component, OnInit } from '@angular/core';
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
  user?: UserInterface | null; // Change from Observable to the actual UserInterface
  constructor(private authService: AuthserviceService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user: UserInterface | null) => {
      this.user = user; // Store the user data directly
      if (user) {
        const userInfo: UserInterface = {
          email: user.email!,
          username: user.username,
        };
        this.authService.setCurrentUser(userInfo); // Use the setCurrentUser method
      } else {
        this.authService.setCurrentUser(null); // Handle null case
      }

      // Log the currentUserSig after setting
      console.log('Current User Signature:', this.authService.currentUserSig()); // Use () to get the value of the signal
    });
  }
}