import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LogoComponent } from '../landing-shared/logo/logo.component';
import { LinksComponent } from '../landing-shared/links/links.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-landing-new-password',
  standalone: true,
  imports: [
    CommonModule, 
    LogoComponent, 
    LinksComponent, 
    MatIcon, 
    MatIconModule, 
    RouterLink, 
    RouterLinkActive, 
    ReactiveFormsModule, 
    RouterModule, 
    MatButtonModule
  ],
  templateUrl: './landing-new-password.component.html',
  styleUrls: ['./landing-new-password.component.scss']
})
export class LandingNewPasswordComponent {
  passwordForm: FormGroup;
  passwordsDoNotMatch: boolean = false;
  showSuccessMessage = false;
  focusStates = {
    password1: false,
    password2: false,
  }; 
  constructor(private fb: FormBuilder, private router:Router) {
    this.passwordForm = this.fb.group({
      password1: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)]],
      password2: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)]],
    });
  }

   
  checkEmptyFields() {
    const { password1, password2 } = this.passwordForm.controls;

    if (!password1.value) {
      password1.setErrors({ required: true });
    }
    if (!password2.value) {
      password2.setErrors({ required: true });
    }
  }

  checkPasswordsMatch() {
    const password1 = this.passwordForm.get('password1')?.value;
    const password2 = this.passwordForm.get('password2')?.value;

    this.passwordsDoNotMatch = password1 && password2 && password1 !== password2;
  }

  onSubmit() {
    if (this.passwordForm.valid && !this.passwordsDoNotMatch) {
      console.log('Form Submitted', this.passwordForm.value);
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false; 
        this.router.navigate(['/']);
      }, 2000);
    }
  }

  onFocus(field: 'password1' | 'password2') {
    this.focusStates[field] = true;
  }
  
  onBlur(field: 'password1' | 'password2') {
    this.focusStates[field] = false;
  }

  
}