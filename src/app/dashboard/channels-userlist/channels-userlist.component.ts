import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';

@Component({
  selector: 'app-channels-userlist',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatTreeModule,
    CommonModule
  ],
  templateUrl: './channels-userlist.component.html',
  styleUrls: ['./channels-userlist.component.scss']
})
export class ChannelsUserlistComponent {
  isChannelOpen: boolean = false;
  isCloseChannelSection: boolean = false;
  isChannelButtonDisable: boolean = false;

  isDirectMessagesOpen: boolean = false;
  isCloseDirectMessagesSection: boolean = false;
  isDirectMessagesButtonDisable: boolean = false;

  channels = [
    { name: 'Entwicklerteam' },
    { name: 'Office-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' }
  ];

  direct_messages = [
    { name: 'Maximilian Mustermann' },
    { name: 'Maximilian Mustermann' },
    { name: 'Maximilian Mustermann' },
    { name: 'Maximilian Mustermann' },
    { name: 'Maximilian Mustermann' },
    { name: 'Maximilian Mustermann' },
    { name: 'Maximilian Mustermann' },
    { name: 'Maximilian Mustermann' }
  ];

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

  toggleDirectMessages() {
    if (this.isDirectMessagesButtonDisable) return;

    this.isDirectMessagesButtonDisable = true;
    this.isDirectMessagesOpen = !this.isDirectMessagesOpen;

    if (!this.isDirectMessagesOpen) {
      this.isCloseDirectMessagesSection = true;
    }

    setTimeout(() => {
      this.isCloseDirectMessagesSection = this.isDirectMessagesOpen;
      this.isDirectMessagesButtonDisable = false;
    }, this.arrayTimerDM());

    this.updateTabArrow('#dmIcon');
  }

  updateTabArrow(id: string) {
    let icon = document.querySelector(id);
    if (icon && id == '#channelIcon') this.toggleChannelIcon(icon);
    if (icon && id == '#dmIcon') this.toggleDMIcon(icon);
  }

  toggleDMIcon(icon: Element) {
    icon.classList.toggle('rotate-down', this.isDirectMessagesOpen);
    icon.classList.toggle('rotate-right', !this.isDirectMessagesOpen);
  }

  toggleChannelIcon(icon: Element) {
    icon.classList.toggle('rotate-down', this.isChannelOpen);
    icon.classList.toggle('rotate-right', !this.isChannelOpen);
  }

  getAnimationDelayChannel(index: number): number {
    if (this.isChannelOpen) {
      return index * 0.10;
    } else {
      let totalButtons = this.channels.length;
      return (totalButtons - index - 1) * 0.10;
    }
  }

  getAnimationDelayDM(index: number): number {
    if (this.isDirectMessagesOpen) {
      return index * 0.10;
    } else {
      let totalButtons = this.direct_messages.length;
      return (totalButtons - index - 1) * 0.10;
    }
  }

  arrayTimerChannels(): number {
    return (this.channels.length * 100) + 50;
  }

  arrayTimerDM(): number {
    return (this.direct_messages.length * 100) + 50;
  }

  getChannelsMaxHeight(): number {
    return this.channels.length * 50;
  }

  getChannelsTransitionDuration(): string {
    let duration = this.channels.length * 0.12;
    return `max-height ${duration}s ease-in-out`;
  }
}
