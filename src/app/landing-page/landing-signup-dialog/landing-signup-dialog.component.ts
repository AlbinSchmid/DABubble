import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
    name: false,
    email: false,
    password: false,
    checkbox:false,
  };
  constructor(private fb: FormBuilder, private formDataService: FormDataService, private router:Router,) {
    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      privacyPolicy: [false, Validators.requiredTrue],
    });
  }

  ngOnInit() {
    this.accountForm.valueChanges.subscribe(value => {
      this.formDataService.updateFormData(value); 
    });
  }

  onSubmit() {
    if (this.accountForm.valid) {
      const formData = { ...this.accountForm.value, avatar: this.selectedAvatar };
      console.log('Form Data with Avatar:', formData);
      this.router.navigate(['/avatar-picker']);
    }
  }

  onInputFocus(inputType: 'name' | 'email' | 'password' | 'checkbox') {
    this.isFocused[inputType] = true;
  }

  onInputBlur(inputType: 'name' | 'email' | 'password' | 'checkbox') {
    this.isFocused[inputType] = false;
  }

}