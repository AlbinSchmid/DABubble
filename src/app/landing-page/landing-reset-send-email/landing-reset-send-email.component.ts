import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LogoComponent } from '../landing-shared/logo/logo.component';
import { LinksComponent } from '../landing-shared/links/links.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive, RouterModule,  } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { AuthserviceService } from '../services/authservice.service';


@Component({
  selector: 'app-landing-reset-send-email',
  standalone: true,
  imports: [CommonModule, LogoComponent, LinksComponent, MatIcon,
     MatIconModule, RouterLink, RouterLinkActive, FormsModule, ReactiveFormsModule,RouterModule, MatButtonModule, MatButton ],
  templateUrl: './landing-reset-send-email.component.html',
  styleUrl: './landing-reset-send-email.component.scss'
})
export class LandingResetSendEmailComponent {
  isFocused = {email: false,  };
  showSuccessMessage = false;
  authService = inject(AuthserviceService)
  resetForm: FormGroup;
  errorMessage: string | null = null;
  constructor(private fb: FormBuilder, private router: Router) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
    });
  }

  onInputFocus(inputType:  'email' ) {
    this.isFocused[inputType] = true;
  }

  onInputBlur(inputType: 'email') {
    this.isFocused[inputType] = false;
  }

  onSubmit() {
    if (this.resetForm.valid) {
      const email = this.resetForm.get('email')?.value; // Get email value

      this.authService.resetPassword(email).subscribe(
        () => {
          this.showSuccessMessage = true;
          this.errorMessage = null; // Clear error message
          setTimeout(() => {
            this.showSuccessMessage = false; 
            this.router.navigate(['/']);
          }, 2000);
        },
        (error) => {
          this.errorMessage = error.message; // Set error message
          this.showSuccessMessage = false; // Hide success message
        }
      );
    }
  }

}
