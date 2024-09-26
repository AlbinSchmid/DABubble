import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LandingLoginDialogComponent } from "./landing-login-dialog/landing-login-dialog.component";
import { StartAnimationComponent } from './start-animation/start-animation.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LandingLoginDialogComponent, StartAnimationComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
