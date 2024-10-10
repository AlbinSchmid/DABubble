import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, inject, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { UserInterface } from '../../landing-page/interfaces/userinterface';
import { isFormArray } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    RouterLink,
    CommonModule,
    MenuComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;
  authService = inject(AuthserviceService)

  
  userStatus = 'on';
  isProfileMenuOpen = false;
  isUnderMenuOpen = false;
  isOpenEditEditor = false;

  focusSearchInput(): void {
    this.searchInput.nativeElement.focus();
  }

  closeProfileMenu(): void {
    let menuElement = document.querySelector('.profile-menu-contain');

    if (this.isProfileMenuOpen) {
      menuElement!.classList.remove('open');
      menuElement!.classList.add('close');
      setTimeout(() => {
        this.isProfileMenuOpen = false;
      }, 120);
    }
    if (this.isUnderMenuOpen) {
      setTimeout(() => this.isUnderMenuOpen = false, 120);
    }
    if (this.isOpenEditEditor) {
      setTimeout(() => this.isOpenEditEditor = false, 120);
    }
  }

  onStatusChange(newStatus: string): void {
    this.userStatus = newStatus;
  }

  onUnderMenuStatusChange(isOpen: boolean): void {
    this.isUnderMenuOpen = isOpen;
  }

  onEditEditorChange(isOpen: boolean): void {
    this.isUnderMenuOpen = isOpen;
  }

  ngOnInit(): void {
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        const newUser: UserInterface = {
          userID: user.uid,
          password: '',
          email: user.email,
          username: user.displayName,
          avatar: user.photoURL,
          isFocus: user.isFocus,
          userStatus: user.userStatus
        };
        this.authService.currentUserSig.set(newUser);
      } else {
        this.authService.setCurrentUser(null);
      }
    });
  }
}
