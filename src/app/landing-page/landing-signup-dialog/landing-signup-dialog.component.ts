import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';


import { LinksComponent } from '../landing-shared/links/links.component';
import { Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { LogoComponent } from "../landing-shared/logo/logo.component";

import { AuthserviceService } from '../services/authservice.service';
@Component({
  selector: 'app-landing-signup-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LinksComponent, RouterLink, MatButton, MatIcon, MatIconModule, LogoComponent],
  templateUrl: './landing-signup-dialog.component.html',
  styleUrl: './landing-signup-dialog.component.scss'
})
export class LandingSignupDialogComponent implements OnInit {
  selectedAvatar: string = '';
  isFocused = {username: false, email: false,password: false,checkbox:false,};
  fb=inject(FormBuilder)


  authService = inject(AuthserviceService)
  constructor(private router:Router,) { }


  
  accountForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    privacyPolicy: [false, Validators.requiredTrue],
  });

  errorMessage: string | null = null;

  ngOnInit() {
   
  }

  onSubmit(): void {
    const rawForm = this.accountForm.getRawValue();
  
    if (this.accountForm.valid) {
      this.authService.setTempUserData({
        email: rawForm.email,
        username: rawForm.username,
        password: rawForm.password,
        avatar: '',
      });
      this.router.navigateByUrl('/avatar-picker');  
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-exists':
        return 'Die angegebene E-Mail-Adresse wird bereits verwendet.';
      case 'auth/weak-password':
        return 'Das Passwort ist zu schwach.';
      case 'auth/invalid-email':
        return 'Die angegebene E-Mail-Adresse ist ungültig.';
      default:
        return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
    }
  }

  onInputFocus(inputType: 'username' | 'email' | 'password' | 'checkbox') {
    this.isFocused[inputType] = true;
  }

  onInputBlur(inputType: 'username' | 'email' | 'password' | 'checkbox') {
    this.isFocused[inputType] = false;
  }

}