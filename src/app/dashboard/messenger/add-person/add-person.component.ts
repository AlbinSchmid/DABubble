import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { CommonModule } from '@angular/common';
import { DetailPersonComponent } from '../detail-person/detail-person.component';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { MatChipsModule } from '@angular/material/chips';
import { MembersSourceService } from '../../../shared/services/members-source.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { MatRadioModule } from '@angular/material/radio';
import { FilteredListComponent } from './filtered-list/filtered-list.component';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';

@Component({
  selector: 'app-add-person',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatChipsModule,
    MatRadioModule,
    FilteredListComponent
  ],
  templateUrl: './add-person.component.html',
  styleUrl: './add-person.component.scss'
})
export class AddPersonComponent {
  messengerService = inject(MessengerService);
  authService = inject(AuthserviceService);
  dialog = inject(MatDialog);
  firestoreService = inject(FirestoreService);
  memberSourceService = inject(MembersSourceService);

  @Input() users: UserInterface[] = [];
  @Input() addPersonView: boolean = false;
  @Output() closeOverlay = new EventEmitter<void>();

  @ViewChild('userInput') userInputElement!: ElementRef<HTMLInputElement>;

  filteredUsers: UserInterface[] = [];
  highlightedIndex = -1;


  /**
   * Returns the text to show in the header of the add person view.
   * If addPersonView is true, it returns 'Leute hinzufügen', otherwise it returns 'Mitglieder'.
   */
  checkText(): string {
    return this.addPersonView ? 'Leute hinzufügen' : 'Mitglieder';
  }


  /**
   * Opens the add person view and resets the input field.
   * Also focuses the input field.
   */
  openAddPerson():void {
    this.memberSourceService.membersSource.set([]);
    this.addPersonView = true;
    setTimeout(() => this.userInputElement.nativeElement.focus(), 100);
  }


  /**
   * Closes the add person dialog by emitting a closeOverlay event.
   */
  closeDialog():void {
    this.closeOverlay.emit();
  }


  /**
   * Opens a dialog to display the details of a selected person.
   * 
   * @param user - The user object containing details to be displayed in the dialog.
   *                Sets the user as focused and shows the message button.
   */
  openDialogDetailPerson(user: any) {
    this.messengerService.showMessageBtn = true;
    user.isFocus = true;
    this.dialog.open(DetailPersonComponent, {
      data: user,
    });
  }


  /**
   * Handles the wheel event on the user list element.
   * Scrolls the element horizontally by the deltaY value of the event.
   * Prevents the default behavior of the wheel event, so the user list
   * does not scroll vertically when the user scrolls horizontally.
   * @param event - The WheelEvent to be handled.
   */
  onWheel(event: WheelEvent):void {
    let element = event.currentTarget as HTMLElement;
    event.preventDefault();
    element.scrollLeft += event.deltaY;
  }


  /**
   * Removes a user from the list of selected users.
   * 
   * @param member - The user object to be removed.
   */
  remove(member: UserInterface): void {
    this.memberSourceService.membersSource.update(members => {
      let index = members.indexOf(member);
      if (index >= 0) {
        members.splice(index, 1);
      }
      return [...members];
    });
  }


  /**
   * Handles the keydown event on the input element.
   * Prevents the default behavior of the arrow up and arrow down keys.
   * If the user presses the arrow down key, the highlighted index is incremented
   * and the user is scrolled to the selected user.
   * If the user presses the arrow up key, the highlighted index is decremented
   * and the user is scrolled to the selected user.
   * If the user presses the enter key and a user is selected, the selected user is added.
   * @param event - The KeyboardEvent to be handled.
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
    }
    if (this.filteredUsers.length > 0) {
      if (event.key === 'ArrowDown') {
        this.highlightedIndex = (this.highlightedIndex + 1) % this.filteredUsers.length;
        this.scrollToSelectedUser();
      } else if (event.key === 'ArrowUp') {
        this.highlightedIndex = (this.highlightedIndex - 1 + this.filteredUsers.length) % this.filteredUsers.length;
        this.scrollToSelectedUser();
      } else if (event.key === 'Enter' && this.highlightedIndex >= 0) {
        this.add(this.filteredUsers[this.highlightedIndex]);
      }
    }
  }


  /**
   * Scrolls to the selected user in the list of users.
   * @private
   */
  scrollToSelectedUser(): void {
    let matCardContent = document.querySelector('mat-card-content') as HTMLElement;
    let selectedButton = matCardContent.querySelectorAll('button')[this.highlightedIndex] as HTMLElement;
    if (selectedButton) {
      selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }


  /**
   * Adds a user to the list of selected members and updates the input field.
   * 
   * If a user is provided, the user is added to the members source,
   * the input field is cleared, and the list of filtered users is
   * reset. Finally, the view scrolls to the right to accommodate
   * the new member.
   * 
   * @param user - The user object to be added to the members list.
   */
  add(user: UserInterface): void {
    if (user) {
      this.memberSourceService.membersSource.update(members => [...members, user]);
      this.userInputElement.nativeElement.value = '';
      this.highlightedIndex = -1;
      this.filteredUsers = [];
    }
    this.scrollToRight();
  }


  /**
   * Smoothly scrolls the '.add-specific-member-contain' element to the far right.
   * If the element is found, it waits for 100 milliseconds and then scrolls
   * to the maximum horizontal scroll position with a smooth animation. 
   * Once scrolled, it calls the scrollinInuptToRight function to potentially 
   * focus the input field based on certain conditions.
   */
  scrollToRight(): void {
    let element = document.querySelector('.add-specific-member-contain') as HTMLElement;
    if (element) {
      setTimeout(() => {
        element.scrollTo({
          left: element.scrollWidth,
          behavior: 'smooth'
        });
        this.scrollinInuptToRight(element);
      }, 100);
    }
  }


  /**
   * Focuses the input field when the user scrolls to the right edge of the
   * user list element. If there are no members in the list, the input field is
   * focused immediately.
   * @private
   * @param element - The user list element to be scrolled.
   */
  scrollinInuptToRight(element: HTMLElement) {
    if (this.memberSourceService.membersSource().length < 1) {
      this.userInputElement.nativeElement.focus();
    } else {
      element.addEventListener('scroll', () => {
        if (element.scrollLeft + element.clientWidth >= element.scrollWidth && this.userInputElement) {
          this.userInputElement.nativeElement.focus();
        }
      }, { once: false });
    }
  }


  /**
   * Handles the input event on the input element.
   * If the input element has a value, it searches the user list for users that
   * have a username that contains the input value (case insensitive). The users
   * that are already in the members list or have the same ID as the current user
   * are excluded from the search result. The result is then stored in the
   * filteredUsers property.
   * If the input element does not have a value, the filteredUsers property is
   * reset to an empty array and the highlightedIndex property is set to -1.
   * @param event - The InputEvent to be handled.
   */
  searchUserByName(event: Event): void {
    let inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.trim().toLowerCase();
    let existingMembersOnInput = this.memberSourceService.membersSource().map(member => member.userID);
    let currentUser = this.authService.currentUserSig()!.userID;
    let userValue = this.firestoreService.userList$.value;
    if (value) {
      this.searchUser(userValue, value, existingMembersOnInput, currentUser);
    } else {
      this.filteredUsers = [];
      this.highlightedIndex = -1;
    }
  }

  /**
   * Searches the user list for users that have a username that contains the given value
   * (case insensitive). The users that are already in the members list or have the same
   * ID as the current user are excluded from the search result. The result is then stored
   * in the filteredUsers property and the highlightedIndex property is set to -1.
   *
   * @param userValue - The list of users to search in.
   * @param value - The value to search for in the user list.
   * @param existingMembersOnInput - The list of user IDs that are already in the input field.
   * @param currentUser - The ID of the current user.
   */
  searchUser(userValue: UserInterface[], value: string, existingMembersOnInput: string[], currentUser: string): void {
    this.filteredUsers = userValue.filter(user => {
      let fullName = user.username.toLowerCase();
      return fullName.includes(value) && !this.existingMembersOnChannel().includes(user.userID) && !existingMembersOnInput.includes(user.userID) && user.userID !== currentUser;
    });
    this.highlightedIndex = -1;
  }


  /**
   * Returns an array of user IDs that are currently in the members list of the channel.
   * @returns {string[]} - An array of user IDs.
   */
  existingMembersOnChannel(): string[] {
    return this.users.map(member => member.userID);
  }


  /**
   * Handles the userSelected event emitted by the FiltredListComponent.
   * If a user is provided, the user is added to the members source,
   * the input field is cleared, and the list of filtered users is
   * reset. Finally, the view scrolls to the right to accommodate
   * the new member.
   * @param user - The user object to be added to the members list.
   */
  onUserAdded(user: UserInterface): void {
    if (user) {
      this.memberSourceService.membersSource.update(members => [...members, user]);
      this.userInputElement.nativeElement.value = '';
      this.highlightedIndex = -1;
      this.filteredUsers = [];
    }
    this.scrollToRight();
  }


  /**
   * Adds selected members to the current channel by updating the Firestore document.
   * It retrieves the current channel from the messenger service and gets the user IDs
   * of new members to be added. These IDs are concatenated with existing members' IDs
   * of the channel. The combined list is then used to update the channel document in
   * Firestore. If the update is successful, the dialog is closed; otherwise, an error
   * is logged to the console.
   */
  async addMembersToChannel(): Promise<void> {
    let channel = this.messengerService.channel;
    let newUser = this.getUserIDs();
    let allMember = newUser.concat(this.existingMembersOnChannel());
    try {
      await this.firestoreService.updateDoc('channels', channel.channelID!, { userIDs: allMember });
      this.closeDialog();
    } catch (err) {
      console.error(err);
    }
  }


  /**
   * Retrieves the user IDs of all members in the members source.
   * @returns An array of user IDs.
   */
  getUserIDs(): string[] {
    let members = this.memberSourceService.membersSource();
    return members.map(user => user.userID);
  }


  /**
   * Clears the members source when the component is destroyed.
   * Sets the members source to an empty array to ensure that
   * the temporary state is reset and resources are cleaned up.
   */
  ngOnDestroy(): void {
    this.memberSourceService.membersSource.set([]);
  }
}
