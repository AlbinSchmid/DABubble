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
} from '@angular/forms';


import { MyErrorStateMatcher } from '../services/error.service';
import { LinksComponent } from '../landing-shared/links/links.component';
import { RouterModule, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-landing-signup-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LinksComponent,],
  templateUrl: './landing-signup-dialog.component.html',
  styleUrl: './landing-signup-dialog.component.scss'
})
export class LandingSignupDialogComponent {
  form: FormGroup;
  isFocused = { name: false, email: false, password: false };
  constructor() {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      policy: new FormControl(false, [Validators.requiredTrue]),
    });
  }

  get nameFormControl() {
    return this.form.get('name') as FormControl;
  }

  get emailFormControl() {
    return this.form.get('email') as FormControl;
  }

  get passwordFormControl() {
    return this.form.get('password') as FormControl;
  }

  get policyFormControl() {
    return this.form.get('policy') as FormControl;
  }

  onInputFocus(inputType: 'name' | 'email' | 'password') {
    this.isFocused[inputType] = true;
  }

  onInputBlur(inputType: 'name' | 'email' | 'password') {
    this.isFocused[inputType] = false;
  }

  toggleCheckbox(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.policyFormControl.setValue(isChecked);
    this.policyFormControl.markAsTouched(); // Mark as touched to show error if unchecked
  }
}