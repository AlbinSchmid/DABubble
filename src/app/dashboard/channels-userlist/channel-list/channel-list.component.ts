import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { Channel } from '../../../shared/interfaces/channel';
import { Subscription } from 'rxjs';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss'
})
export class ChannelListComponent {

  firestoreService: FirestoreService = inject(FirestoreService);

  channelList: Channel[] = [];
  channelListSubscription!: Subscription;

  userList: UserInterface[] = [];
  userListSubscription!: Subscription;


  isChannelOpen: boolean = false;
  isCloseChannelSection: boolean = false;
  isChannelButtonDisable: boolean = false;


  dummyChannel: Channel = {
    title: 'bambus',
    description: 'test',
    createdBy: 'test',
    isFocus: false,
    user: [],
    messages: []
  }

  constructor() { }

  ngOnInit(): void {
    this.firestoreService.startSnapshot('channels');

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

  // ngAfterViewInit() {
  //   setTimeout(() => this.toggleChannels(), 1000);
  // }

  toggleChannels() {
    if (this.isChannelButtonDisable) return;

    this.isChannelButtonDisable = true;
    this.isChannelOpen = !this.isChannelOpen;

    if (!this.isChannelOpen) {
      this.isCloseChannelSection = true;
    }

    setTimeout(() => {
      this.isCloseChannelSection = this.isChannelOpen;
      this.isChannelButtonDisable = false;
    }, this.arrayTimerChannels());

    this.updateTabArrow('#channelIcon');
  }

  updateTabArrow(id: string) {
    let icon = document.querySelector(id);
    if (icon && id == '#channelIcon') this.toggleChannelIcon(icon);
  }

  toggleChannelIcon(icon: Element) {
    icon.classList.toggle('rotate-down', this.isChannelOpen);
    icon.classList.toggle('rotate-right', !this.isChannelOpen);
  }

  getAnimationDelayChannel(index: number): number {
    if (this.isChannelOpen) {
      return index * 0.10;
    } else {
      let totalButtons = this.channelList.length;
      return (totalButtons - index - 1) * 0.10;
    }
  }

  getAnimationDelayAddChannel() {
    let totalButtons = this.channelList.length;

    if (this.isChannelOpen) {
      return totalButtons * 0.10;
    } else {
      return (totalButtons - totalButtons - 1) * 0.10;
    }
  }

  arrayTimerChannels(): number {
    return (this.channelList.length * 100) + 50;
  }

  getChannelsMaxHeight(): number {
    return this.channelList.length * 50 + 50;
  }

  getChannelsTransitionDuration(): string {
    let duration = this.channelList.length * 0.12;
    return `max-height ${duration}s ease-in-out`;
  }

  async addChannel() {
    try {
      this.toggleChannels();
      await new Promise(resolve => setTimeout(resolve, this.arrayTimerChannels() + 200));
      await this.firestoreService.addDoc(this.dummyChannel, 'channels');
      this.toggleChannels();
    } catch (error) {
      console.error("Failed to add the channel:", error);
    }
  }

  focusChannel(channel: Channel) {
    this.resetUserFocus();
    this.channelList.forEach(c => c.isFocus = false);
    channel.isFocus = true;
  }

  resetUserFocus(): void {
    this.userList.forEach(user => user.isFocus = false);
  }
}
