import { CommonModule } from '@angular/common';
import { Component,
  
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


import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-landing-login-dialog',
  standalone: true,
  imports: [CommonModule,MatIconModule, MatInputModule, MatIcon, FormsModule,
     MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatButton, RouterLink, RouterLinkActive, ],
  templateUrl: './landing-login-dialog.component.html',
  styleUrl: './landing-login-dialog.component.scss',
})
export class LandingLoginDialogComponent {
  loginForm: FormGroup;
  constructor(private fb: FormBuilder) {
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
}
