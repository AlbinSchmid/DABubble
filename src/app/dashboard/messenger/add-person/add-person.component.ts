import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MentionUserInterface } from '../../../shared/interfaces/mention-user-interface';
import { MatIconModule } from '@angular/material/icon';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { CommonModule } from '@angular/common';
import { DetailPersonComponent } from '../detail-person/detail-person.component';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { MatChipsModule } from '@angular/material/chips';
import { MembersSourceService } from '../../../shared/services/members-source.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';

@Component({
  selector: 'app-add-person',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatChipsModule
  ],
  templateUrl: './add-person.component.html',
  styleUrl: './add-person.component.scss'
})
export class AddPersonComponent {
  messengerService = inject(MessengerService);
  authService = inject(AuthserviceService);
  dialog = inject(MatDialog);

  @ViewChild('userInput') userInputElement!: ElementRef<HTMLInputElement>;
  memberSourceService: MembersSourceService = inject(MembersSourceService);
  inputUserList: UserInterface[] = [];
  filteredUsers: UserInterface[] = [];
  highlightedIndex: number = -1;


  @Input() users: UserInterface[] = [];
  @Input() addPersonView: boolean = false;
  @Output() closeOverlay = new EventEmitter<void>();

  checkText() {
    console.log(this.addPersonView);

    return this.addPersonView ? 'Leute hinzufügen' : 'Mitglieder';
  }


  closeDialog() {
    this.closeOverlay.emit();
  }


  openDialogDetailPerson(user: any) {
    this.dialog.open(DetailPersonComponent, {
      data: user,
    });
  }

  onWheel(event: WheelEvent) {
    let element = event.currentTarget as HTMLElement;

    event.preventDefault();
    element.scrollLeft += event.deltaY;
  }

  remove(member: UserInterface): void {
    this.memberSourceService.membersSource.update(members => {
      let index = members.indexOf(member);
      if (index >= 0) {
        members.splice(index, 1);
        this.inputUserList = this.memberSourceService.membersSource();
      }
      return [...members];
    });
  }

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

  scrollToSelectedUser(): void {
    let matCardContent = document.querySelector('mat-card-content') as HTMLElement;
    let selectedButton = matCardContent.querySelectorAll('button')[this.highlightedIndex] as HTMLElement;

    if (selectedButton) {
      selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }

  add(user: UserInterface): void {
    if (user) {
      this.memberSourceService.membersSource.update(members => [...members, user]);
      this.inputUserList = this.memberSourceService.membersSource();
      this.userInputElement.nativeElement.value = '';
      this.highlightedIndex = -1;
      this.filteredUsers = [];
    }
    this.scrollToRight();
  }

  scrollToRight(): void {
    let element = document.querySelector('.add-specific-member-contain') as HTMLElement;

    if (element) {

      setTimeout(() => {
        element.scrollTo({
          left: element.scrollWidth,
          behavior: 'smooth'
        });

        if (this.inputUserList.length < 3) {
          this.userInputElement.nativeElement.focus();
        } else {
          element.addEventListener('scroll', () => {
            if (element.scrollLeft + element.clientWidth >= element.scrollWidth && this.userInputElement) {
              this.userInputElement.nativeElement.focus();
            }
          }, { once: false });
        }
      }, 100);
    }
  }

  searchUserByName(event: Event): void {
    // let inputElement = event.target as HTMLInputElement;
    // let value = inputElement.value.trim().toLowerCase();
    // let existingMembers = this.memberSourceService.membersSource().map(member => member.userID);
    // let currentUser = this.authService.currentUserSig()!.userID;

    // if (value) {
    //   this.filteredUsers = this.users.filter(user => {
    //     let fullName = user.username.toLowerCase();
    //     return fullName.includes(value) && !existingMembers.includes(user.userID) && user.userID !== currentUser;
    //   });
    //   this.highlightedIndex = -1;
    // } else {
    //   this.filteredUsers = [];
    //   this.highlightedIndex = -1;
    // }
  }
}
