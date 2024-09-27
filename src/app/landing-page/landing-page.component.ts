import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LandingLoginDialogComponent } from "./landing-login-dialog/landing-login-dialog.component";
import { StartAnimationComponent } from './start-animation/start-animation.component';
import { LinksComponent } from './landing-shared/links/links.component';
import { SessionService } from './services/session.service';
import { LogoComponent } from "./landing-shared/logo/logo.component";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LandingLoginDialogComponent, StartAnimationComponent, RouterLink, RouterLinkActive, LinksComponent, LogoComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  showAnimation: boolean = true; // Initially show the animation
  showLogo: boolean = false; // Control the visibility of the logo

  constructor(private sessionService: SessionService) { }

  ngOnInit(): void {
    // Check if it's the first visit
    if (this.sessionService.isFirstVisit()) {
      this.showAnimation = true; // Show animation for the first visit
    } else {
      this.showAnimation = false; // Skip animation on subsequent visits
      this.showLogo = true; // Show logo immediately
    }
  }

  ngAfterViewInit() {
    // If it's the first visit, wait for the animation duration to show the logo
    if (this.showAnimation) {
      setTimeout(() => {
        this.showAnimation = false; // Hide the animation
        this.showLogo = true; // Show the logo after 4 seconds
      }, 4000); // Adjust this time according to your animation duration
    }
  }
}
