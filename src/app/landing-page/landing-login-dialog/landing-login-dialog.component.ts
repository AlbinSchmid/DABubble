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
  isInputFocused: boolean = false;
  isEmailFocused: boolean = false
  onFocus() {
    this.isInputFocused = true;
  }

  onBlur() {
    this.isInputFocused = false;
  }
  
  onEmailFocus(){
    this.isEmailFocused = true
  }
  onEmailBlur(){
    this.isEmailFocused = false
  }
}
