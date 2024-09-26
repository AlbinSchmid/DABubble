import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
@Component({
  selector: 'app-landing-login-dialog',
  standalone: true,
  imports: [CommonModule,MatIconModule, MatInputModule, MatIcon],
  templateUrl: './landing-login-dialog.component.html',
  styleUrl: './landing-login-dialog.component.scss'
})
export class LandingLoginDialogComponent {

}
