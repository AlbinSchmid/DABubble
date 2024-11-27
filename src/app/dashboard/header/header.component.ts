import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MenuComponent } from './menu/menu.component';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { UserInterface } from '../../landing-page/interfaces/userinterface';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { SearchService } from '../../shared/services/search-service/search.service';
import { SearchResultComponent } from "../../shared/components/search-result/search-result.component";
import { ViewportService } from '../../shared/services/viewport.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    CommonModule,
    MenuComponent,
    SearchResultComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;

  authService: AuthserviceService = inject(AuthserviceService)
  firestore: Firestore = inject(Firestore);
  searchService: SearchService = inject(SearchService);
  viewportService: ViewportService = inject(ViewportService);

  userStatus: string = 'on';

  isProfileMenuOpen: boolean = false;
  isUnderMenuOpen: boolean = false;
  isOpenEditEditor: boolean = false;


  constructor() { }

  /**
   * Focuses the search input element.
   */
  focusSearchInput(): void {
    this.searchInput.nativeElement.focus();
  }

  onSearch() {
    this.searchService.search(this.searchInput.nativeElement.value)
  }

  /**
   * Closes the profile menu and under menu, and also closes the edit user
   * editor if it is open. The menu and under menu are closed by adding the
   * class 'close' to the element with the class 'profile-menu-contain', and
   * removing the class 'open' from the same element. The edit user editor is
   * closed by setting the boolean isOpenEditEditor to false. The menu is
   * closed after a delay of 120ms, and the edit user editor is closed after
   * the same delay.
   */
  closeProfileMenu(): void {
    let menuElement = document.querySelector('.profile-menu-contain');
    if (this.isProfileMenuOpen) {
      menuElement!.classList.remove('open');
      menuElement!.classList.add('close');
      setTimeout(() => { this.isProfileMenuOpen = false; }, 120);
    }
    if (this.isUnderMenuOpen) {
      setTimeout(() => this.isUnderMenuOpen = false, 120);
    }
    if (this.isOpenEditEditor) {
      setTimeout(() => this.isOpenEditEditor = false, 120);
    }
  }

  /**
   * Updates the user status with the given new status. The new status is one
   * of 'on', 'off', or 'busy'. This function is called when the user status is changed in the menu component.
   * @param newStatus The new status of the user. Must be one of 'on', 'off', or 'busy'.
   */
  onStatusChange(newStatus: string): void {
    this.userStatus = newStatus;
  }

  /**
   * Sets the boolean isUnderMenuOpen to the given value. This function is
   * called when the under menu is opened or closed in the menu component.
   * @param isOpen The new value of isUnderMenuOpen.
   */
  onUnderMenuStatusChange(isOpen: boolean): void {
    this.isUnderMenuOpen = isOpen;
  }

  /**
   * Updates the state of the edit editor's open status.
   * Sets the boolean isUnderMenuOpen to the given value.
   * This function is called when the edit editor is opened or closed in the menu component.
   * @param isOpen The new open state of the edit editor.
   */
  onEditEditorChange(isOpen: boolean): void {
    this.isUnderMenuOpen = isOpen;
  }

  /**
   * Fetches the user status from Firestore with the given user ID.
   * Updates the userStatus property with the user's current status.
   * If the user status is not found in Firestore, the userStatus is set to 'on'.
   * @param uid The user ID to fetch the user status for.
   */
  async fetchUserStatus(uid: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data() as UserInterface;
      this.userStatus = userData.userStatus || 'on';
    }
  }

  /**
   * OnInit lifecycle hook. Listens to the user stream from the AuthService
   * and updates the current user and user status when the user changes.
   * If the user is not signed in, the current user is set to null.
   */
  ngOnInit(): void {
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.fetchUserStatus(user.uid);
        const newUser: UserInterface = this.setNewUser(user);
        this.authService.currentUserSig.set(newUser);
      } else {
        this.authService.setCurrentUser(null);
      }
    });
  }

  /**
   * Constructs a new user object from the provided user information.
   * The returned object includes the user's ID, email, display name, avatar, focus status, and current status.
   * The password field is initialized as an empty string.
   */
  setNewUser(user: any) {
    return {
      userID: user.uid,
      password: '',
      email: user.email,
      username: user.displayName,
      avatar: user.photoURL,
      isFocus: user.isFocus,
      userStatus: this.userStatus
    };
  }
}
