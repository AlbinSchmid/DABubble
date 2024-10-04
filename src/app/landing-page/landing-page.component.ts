import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LandingLoginDialogComponent } from "./landing-login-dialog/landing-login-dialog.component";
import { StartAnimationComponent } from './start-animation/start-animation.component';
import { LinksComponent } from './landing-shared/links/links.component';
import { SessionService } from './services/session.service';
import { LogoComponent } from "./landing-shared/logo/logo.component";
import { LandingLoginRegisterButtonComponent } from './landing-login-register-button/landing-login-register-button.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LandingLoginDialogComponent, StartAnimationComponent, RouterLink, RouterLinkActive, LinksComponent, LogoComponent, LandingLoginRegisterButtonComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  showAnimation: boolean = true; 
  showLogo: boolean = false; 

  constructor(private sessionService: SessionService) { }

  ngOnInit(): void {
    if (this.sessionService.isFirstVisit()) {
      this.showAnimation = true; 
    } else {
      this.showAnimation = false; 
      this.showLogo = true; 
    }
  }

  ngAfterViewInit() {
    if (this.showAnimation) {
      setTimeout(() => {
        this.showAnimation = false; 
        this.showLogo = true; 
      }, 4000); 
    }
  }
}
