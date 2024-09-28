import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LogoComponent } from '../landing-shared/logo/logo.component';
import { LinksComponent } from '../landing-shared/links/links.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing-reset-send-email',
  standalone: true,
  imports: [CommonModule, LogoComponent, LinksComponent, MatIcon,
     MatIconModule, RouterLink, RouterLinkActive, FormsModule, ReactiveFormsModule, ],
  templateUrl: './landing-reset-send-email.component.html',
  styleUrl: './landing-reset-send-email.component.scss'
})
export class LandingResetSendEmailComponent {
  isFocused = {email: false,  };
  resetForm: FormGroup;
  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onInputFocus(inputType:  'email' ) {
    this.isFocused[inputType] = true;
  }

  onInputBlur(inputType: 'email') {
    this.isFocused[inputType] = false;
  }
}
