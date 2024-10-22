import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { FirestoreService } from '../../../../shared/services/firebase-services/firestore.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Channel } from '../../../../shared/interfaces/channel';
import { Subscription } from 'rxjs';
import { AnimationChannelService } from '../../channel-list/animation.service.service';
import { AuthserviceService } from '../../../../landing-page/services/authservice.service';
import { UserInterface } from '../../../../landing-page/interfaces/userinterface';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-add-members',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    MatIconModule,
    MatRadioModule,
    MatChipsModule,
    MatFormFieldModule,
    MatCardModule
  ],
  templateUrl: './add-members.component.html',
  styleUrl: './add-members.component.scss'
})
export class AddMembersComponent {

  @Output() inputSelectedChange = new EventEmitter<boolean>();
  @Output() inputValueChange = new EventEmitter<boolean>();
  @Output() membersChange = new EventEmitter<UserInterface[]>();


  firestoreService: FirestoreService = inject(FirestoreService);
  channelAnimationService: AnimationChannelService = inject(AnimationChannelService);
  authService: AuthserviceService = inject(AuthserviceService);

  channelListSubscription!: Subscription;
  channelList: Channel[] = [];

  userListSubscription!: Subscription;
  userList: UserInterface[] = [];

  filteredUsers: UserInterface[] = [];

  members = signal<UserInterface[]>([]);

  scrolledToEnd: boolean = false;
  selectInput: boolean = false;
  endAnimation: boolean = true;
  userNotFound: boolean = false;

  highlightedIndex: number = -1;

  pickChannelValue: string;


  constructor() { }

  get pickChannel(): string {
    return this.pickChannelValue;
  }

  set pickChannel(value: string) {
    this.pickChannelValue = value;
    this.isFocus(value);
  }

  ngOnInit(): void {
    this.channelListSubscription = this.firestoreService.channelList$.subscribe(channel => {
      this.channelList = channel;
    });

    this.userListSubscription = this.firestoreService.userList$.subscribe(user => {
      this.userList = user;
    });
  }

  onWheel(event: WheelEvent) {
    let element = event.currentTarget as HTMLElement;

    event.preventDefault();
    element.scrollLeft += event.deltaY;
  }

  scrollToRight(): void {
    let element = document.querySelector('.add-specific-member-contain') as HTMLElement;
    if (element) {
      setTimeout(() => {
        element.scrollTo({
          left: element.scrollWidth,
          behavior: 'smooth'
        });
      }, 100);
    }
  }

  scrollToSelectedUser(): void {
    let matCardContent = document.querySelector('mat-card-content') as HTMLElement;
    let selectedButton = matCardContent.querySelectorAll('button')[this.highlightedIndex] as HTMLElement;

    if (selectedButton) {
      selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }

  scrollToRightAfterAnimation() {
    let element = document.querySelector('.add-specific-member-contain') as HTMLElement;
    this.members.set([]);
    this.membersChange.emit(this.members());
    if (element) {
      setTimeout(() => {
        element.scrollTo({
          left: element.scrollWidth,
          behavior: 'smooth'
        });
      }, 500);
    }
  }

  resetLowerGroup() {
    if (this.selectInput) {
      this.endAnimation = false;
      this.selectInput = false;
      this.inputSelectedChange.emit(this.selectInput);
      setTimeout(() => this.endAnimation = true, 200);
    } else {
      return;
    }
  }

  resetUpperGroup() {
    this.selectInput = true;
    this.inputSelectedChange.emit(this.selectInput);
    this.pickChannel = '';
  }

  isFocus(selectedTitle: string) {
    this.channelList.forEach(channel => {
      if (channel.title === selectedTitle) {
        this.members.set([]);
        this.membersChange.emit(this.members());
        if (this.selectInput) {
          setTimeout(() => {
            this.members.update(members => [...members, ...channel.user]);
            this.membersChange.emit(this.members());
          }, 200);
        } else {
          this.members.update(members => [...members, ...channel.user]);
          this.membersChange.emit(this.members());
        }
      }
    });
  }

  onScroll(event: Event): void {
    let element = event.target as HTMLElement;
    let atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

    if (atBottom) {
      this.scrolledToEnd = true;
    } else {
      this.scrolledToEnd = false;
    }
  }

  getChannelListClass(): string {
    let channels = this.channelList.length;

    if (channels > 3) {
      return 'scrollable';
    } else if (channels == 1) {
      return 'set-min-height-channel-list';
    } else {
      return '';
    }
  }

  needsToAddScroll() {
    return this.channelList.length > 3;
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

  searchUserByName(event: Event): void {
    let inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.trim().toLowerCase();

    if (value) {
      this.filteredUsers = this.userList.filter(user => {
        let fullName = user.username.toLowerCase();
        return fullName.includes(value);
      });
      this.highlightedIndex = -1;
      this.userNotFound = this.filteredUsers.length === 0;
    } else {
      this.filteredUsers = [];
      this.userNotFound = false;
      this.highlightedIndex = -1;
    }
  }

  add(user: UserInterface): void {
    if (user) {
      this.members.update(members => [...members, user]);
      this.membersChange.emit(this.members());
      let inputElement = document.querySelector('#userinput') as HTMLInputElement;
      if (inputElement) {
        inputElement.value = '';
        this.filteredUsers = [];
      }
    }
    this.scrollToRight();
  }

  remove(member: UserInterface): void {
    this.members.update(members => {
      let index = members.indexOf(member);
      if (index >= 0) {
        members.splice(index, 1);
      }
      this.membersChange.emit(this.members());
      return [...members];
    });
  }
}
