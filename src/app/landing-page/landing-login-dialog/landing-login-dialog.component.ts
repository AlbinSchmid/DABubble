import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';


import { MyErrorStateMatcher } from '../services/error.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-login-dialog',
  standalone: true,
  imports: [CommonModule,MatIconModule, MatInputModule, MatIcon, FormsModule,
     MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatButton],
  templateUrl: './landing-login-dialog.component.html',
  styleUrl: './landing-login-dialog.component.scss',
})
export class LandingLoginDialogComponent {

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }

  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();

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
