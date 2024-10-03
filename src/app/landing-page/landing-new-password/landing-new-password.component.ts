import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LogoComponent } from '../landing-shared/logo/logo.component';
import { LinksComponent } from '../landing-shared/links/links.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AuthserviceService } from '../services/authservice.service';
import { ActivatedRoute } from '@angular/router';

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
  authService = inject(AuthserviceService);
  focusStates = {
    password1: false,
    password2: false,
  };
  oobCode: string | null = null;
  errorMessage: string | null = null;
  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.passwordForm = this.fb.group({
      password1: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)]],
      password2: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)]],
    });

    // Get the oobCode from the route parameters
    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'] || null; // Adjust the query param name as needed
      console.log('Received oobCode:', this.oobCode);
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

  onFocus(field: 'password1' | 'password2') {
    this.focusStates[field] = true;
  }
  
  onBlur(field: 'password1' | 'password2') {
    this.focusStates[field] = false;
  }

  onSubmit() {
    console.log('Form valid:', this.passwordForm.valid);
    console.log('Passwords match:', !this.passwordsDoNotMatch);
    console.log('OobCode:', this.oobCode);
  
    if (this.passwordForm.valid && !this.passwordsDoNotMatch && this.oobCode) {
      const newPassword = this.passwordForm.get('password1')?.value;
      
      this.authService.confirmPasswordReset(this.oobCode, newPassword).subscribe({
        next: () => {
          this.showSuccessMessage = true; 
          setTimeout(() => {
            this.showSuccessMessage = false; 
            this.router.navigate(['/']); 
          }, 2000);
        },
        error: (error) => {
          console.error('Error confirming password reset:', error);
          this.errorMessage = 'Fehler beim Zurücksetzen des Passworts. Bitte versuchen Sie es erneut.'; 
          this.showSuccessMessage = false; 
        }
      });
    } else {
      this.checkEmptyFields(); 
      this.checkPasswordsMatch(); 
    }
  }
}
