import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  @Input() userStatus: string = 'on';
  @Output() userStatusChange = new EventEmitter<string>();

  @Input() isProfileMenuOpen: boolean = false;
  @Output() isProfileMenuOpenChange = new EventEmitter<boolean>();

  @Input() isUnderMenuOpen: boolean = false;
  @Output() isUnderMenuOpenChange = new EventEmitter<boolean>();

  toggleProfileMenu(e: Event): void {
    e.stopPropagation();

    if (!this.isProfileMenuOpen) {
      this.isProfileMenuOpen = true;
      this.isProfileMenuOpenChange.emit(this.isProfileMenuOpen);
    } else {
      let menuElement = document.querySelector('.profile-menu-contain');
      if (menuElement) {
        menuElement.classList.remove('open');
        menuElement.classList.add('close');
        setTimeout(() => {
          this.isProfileMenuOpen = false;
          this.isProfileMenuOpenChange.emit(this.isProfileMenuOpen);
        }, 140);
      }
    }
  }

  openUnderMenuStatus(e: Event): void {
    e.stopPropagation();
    this.isUnderMenuOpen = !this.isUnderMenuOpen;
    this.isUnderMenuOpenChange.emit(this.isUnderMenuOpen);
  }

  userIsOnline() {
    return this.userStatus !== 'off' && this.userStatus !== 'busy';
  }

  userIsOffline() {
    return this.userStatus !== 'on' && this.userStatus !== 'busy';
  }

  userIsBusy() {
    return this.userStatus !== 'off' && this.userStatus !== 'on';
  }

  setUserOnline(e: Event) {
    e.stopPropagation();
    this.userStatus = 'on';
    this.isUnderMenuOpen = false;
    this.userStatusChange.emit(this.userStatus);
    this.isUnderMenuOpenChange.emit(this.isUnderMenuOpen);
  }

  setUserOffline(e: Event) {
    e.stopPropagation();
    this.userStatus = 'off';
    this.isUnderMenuOpen = false;
    this.userStatusChange.emit(this.userStatus);
    this.isUnderMenuOpenChange.emit(this.isUnderMenuOpen);
  }

  setUserBusy(e: Event) {
    e.stopPropagation();
    this.userStatus = 'busy';
    this.isUnderMenuOpen = false;
    this.userStatusChange.emit(this.userStatus);
    this.isUnderMenuOpenChange.emit(this.isUnderMenuOpen);
  }
}
