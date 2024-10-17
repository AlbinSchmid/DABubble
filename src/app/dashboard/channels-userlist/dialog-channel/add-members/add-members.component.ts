import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
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
    MatFormFieldModule
  ],
  templateUrl: './add-members.component.html',
  styleUrl: './add-members.component.scss'
})
export class AddMembersComponent {

  @Output() inputSelectedChange = new EventEmitter<boolean>();
  @Output() inputValueChange = new EventEmitter<boolean>();

  firestoreService: FirestoreService = inject(FirestoreService);
  channelAnimationService: AnimationChannelService = inject(AnimationChannelService);
  authService: AuthserviceService = inject(AuthserviceService);

  channelListSubscription!: Subscription;
  channelList: Channel[] = [];

  userListSubscription!: Subscription;
  userList: UserInterface[] = [];


  scrolledToEnd: boolean;
  selectInput: boolean = false;
  inputValueEmpty: boolean;
  endAnimation: boolean = true;

  pickChannelValue: string;

  fruits = signal<any>([{ name: 'Alex Maximilian' }, { name: 'Ronny Bayer' }, { name: 'Melina Hochee' }]);

  constructor() { }

  get pickChannel(): string {
    return this.pickChannelValue;
  }

  set pickChannel(value: string) {
    this.pickChannelValue = value;
    this.isFocus(value);
  }

  ngOnInit(): void {
    this.firestoreService.startSnapshot('channels');
    this.firestoreService.startSnapshot('users');

    this.channelListSubscription = this.firestoreService.channelList$.subscribe(channel => {
      this.channelList = channel;
    });

    this.userListSubscription = this.firestoreService.userList$.subscribe(user => {
      this.userList = user;
    });
  }

  ngOnDestroy(): void {
    this.firestoreService.stopSnapshot();
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

  scrollToRightAfterAnimation() {
    let element = document.querySelector('.add-specific-member-contain') as HTMLElement;
    if (element) {
      setTimeout(() => {
        element.scrollTo({
          left: element.scrollWidth,
          behavior: 'smooth'
        });
        console.log(this.userList);

      }, 500);
    }
  }

  resetLowerGroup() {
    if (this.selectInput) {
      this.endAnimation = false;
      this.selectInput = false;
      this.inputSelectedChange.emit(this.selectInput);
      setTimeout(() => this.endAnimation = true, 400);
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
      if (channel.title === selectedTitle) console.log(channel);
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
      this.selectInput = true;
      this.inputSelectedChange.emit(this.selectInput);
      return '';
    }
  }

  needsToAddScroll() {
    return this.channelList.length > 3;
  }

  searchUserByName(event: Event): void {
    let inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.trim().toLowerCase();

    console.log('Aktueller Wert:', value);

    this.userList.forEach(user => {
      let fullName = user.username.split(' ');
      let firstName = fullName[0].toLowerCase();
      let lastName = fullName[1]?.toLowerCase();

      if (value == firstName || value == lastName) {
        console.log(`Gefundener Benutzer: ${user.username}`);
      }
    });
  }

  add(event: MatChipInputEvent): void {
    let value = (event.value || '').trim();
    if (value) {
      this.fruits.update(fruits => [...fruits, { name: value }]);
    }
    this.scrollToRight();
    event.chipInput!.clear();
  }

  remove(fruit: any): void {
    this.fruits.update(fruits => {
      let index = fruits.indexOf(fruit);
      if (index < 0) {
        return fruits;
      }

      fruits.splice(index, 1);
      return [...fruits];
    });
  }















}
