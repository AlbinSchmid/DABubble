import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';


import { LinksComponent } from '../landing-shared/links/links.component';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { LogoComponent } from "../landing-shared/logo/logo.component";
@Component({
  selector: 'app-landing-signup-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LinksComponent, RouterLink, MatButton, MatIcon, MatIconModule, LogoComponent],
  templateUrl: './landing-signup-dialog.component.html',
  styleUrl: './landing-signup-dialog.component.scss'
})
export class LandingSignupDialogComponent {
  accountForm: FormGroup;
  isFocused = { name: false, email: false, password: false, checkbox: false, };

  constructor(private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      privacyPolicy: [false, Validators.requiredTrue]
    });
  }

 

  onSubmit() {
    if (this.accountForm.valid) {
      console.log(this.accountForm.value);
    }
  }
  onInputFocus(inputType: 'name' | 'email' | 'password'| 'checkbox') {
    this.isFocused[inputType] = true;
  }

  onInputBlur(inputType: 'name' | 'email' | 'password' | 'checkbox') {
    this.isFocused[inputType] = false;
  }
}