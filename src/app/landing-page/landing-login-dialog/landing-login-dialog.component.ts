import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject,
  
} from '@angular/core';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';


import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthserviceService } from '../services/authservice.service';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-landing-login-dialog',
  standalone: true,
  imports: [CommonModule,MatIconModule, MatInputModule, MatIcon, FormsModule,
     MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatButton, RouterLink, RouterLinkActive,],
  templateUrl: './landing-login-dialog.component.html',
  styleUrl: './landing-login-dialog.component.scss',
})
export class LandingLoginDialogComponent {
  loginForm: FormGroup;
  authService = inject(AuthserviceService)
  errorMessage!: string | null;
  


  constructor(private fb: FormBuilder, private router:Router, private cdr: ChangeDetectorRef) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }


  isFocused = {
    email: false,
    password: false,
  };

  onInputFocus(inputType: 'email' | 'password') {
    this.isFocused[inputType] = true;
  }

  onInputBlur(inputType: 'email' | 'password') {
    this.isFocused[inputType] = false;
  }

  onSubmit(): void {
    const rawForm = this.loginForm.getRawValue();
  
    this.authService.login(rawForm.email, rawForm.password).subscribe({
      next: () => {
       
        this.router.navigateByUrl('/dashboard');
      },
      error: (error) => {
       
        const errorCode = error.code;
  
        if (
          errorCode === 'auth/wrong-password' || 
          errorCode === 'auth/user-not-found' || 
          errorCode === 'auth/invalid-credential' || 
          errorCode === 'auth/invalid-email' || 
          errorCode === 'auth/operation-not-allowed'
        ) {
          console.warn('Login failed with known issue:', error.message);
        
        }
      }
    });
  }

}


