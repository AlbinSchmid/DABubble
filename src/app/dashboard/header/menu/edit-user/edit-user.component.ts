import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthserviceService } from '../../../../landing-page/services/authservice.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent {
  authService = inject(AuthserviceService)
  email: string = 'contact@rene-theis.de';
  inputName: string = '';
  inputEmail: string = '';
  errorMessage: string | null = null; 
  successMessage: string | null = null

  @Input() isOpenEditEditor: boolean = false;

  @Output() isOpenEditEditorChange = new EventEmitter<boolean>();


  isEmailValid(): boolean {
    let emailPattern = /^[^<>@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(this.email);
  }

  cancelProcess() {
    let menuElement = document.querySelector('.profile-menu-contain');
    if (menuElement) {
      menuElement.classList.remove('min-height');
      this.isOpenEditEditor = false;
      this.isOpenEditEditorChange.emit(this.isOpenEditEditor);
    }
  }

  changeEmail() {
    this.authService.changeEmail(this.inputEmail).then(() => {
        this.successMessage = 'Eine Verifizierungs-E-Mail wurde gesendet. Bitte überprüfe deine E-Mails.';
        this.errorMessage = null; 
    }).catch((error) => {
        this.errorMessage = error.message; 
        this.successMessage = null; 
    });
  }

}