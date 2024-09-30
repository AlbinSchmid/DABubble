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
import { FormDataService } from '../services/form-data.service';
import { AuthserviceService } from '../services/authservice.service';
@Component({
  selector: 'app-landing-signup-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LinksComponent, RouterLink, MatButton, MatIcon, MatIconModule, LogoComponent],
  templateUrl: './landing-signup-dialog.component.html',
  styleUrl: './landing-signup-dialog.component.scss'
})
export class LandingSignupDialogComponent implements OnInit {
  accountForm: FormGroup;
  selectedAvatar: string = '';
  isFocused = {
    username: false,
    email: false,
    password: false,
    checkbox:false,
  };
  authService = inject(AuthserviceService)
  constructor(private fb: FormBuilder, private formDataService: FormDataService, private router:Router,) {
    this.accountForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      privacyPolicy: [false, Validators.requiredTrue],
    });
  }

  errorMessage: string | null = null;

  ngOnInit() {
    this.accountForm.valueChanges.subscribe(value => {
      this.formDataService.updateFormData(value); 
    });
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      const formData = { ...this.accountForm.value, avatar: this.selectedAvatar };
  
   
      console.log('Form Data with Avatar:', formData);
      
      this.authService.register(formData.email, formData.username, formData.password)
        .subscribe({
          next: () => {
            this.router.navigateByUrl('/');
          },
          error: (err) => {
            this.errorMessage = this.getErrorMessage(err.code);
          },
        });
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
      // Add more error handling as needed
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