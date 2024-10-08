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
  isChannelButtonDisable: boolean = false; // Verhindert mehrfaches Klicken während der Animationen

  channels = [
    { name: 'Entwicklerteam' },
    { name: 'Office-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' },
    { name: 'Support-Team' }
  ];

  toggleChannels() {
    if (this.isChannelButtonDisable) return;

    this.isChannelButtonDisable = true;
    this.isChannelOpen = !this.isChannelOpen;

    if (!this.isChannelOpen) {
      this.isCloseChannelSection = true;
    }

    let animationTime = this.arrayTimer();

    setTimeout(() => {
      this.isCloseChannelSection = this.isChannelOpen;
      this.isChannelButtonDisable = false;
    }, animationTime);

    this.updateChannelArrow();
  }

  updateChannelArrow() {
    let channelIcon = document.querySelector('#channelIcon');
    if (channelIcon) {
      channelIcon.classList.toggle('rotate-down', this.isChannelOpen);
      channelIcon.classList.toggle('rotate-right', !this.isChannelOpen);
    }
  }

  getAnimationDelay(index: number): number {
    if (this.isChannelOpen) {
      return index * 0.10;
    } else {
      let totalButtons = this.channels.length;
      return (totalButtons - index - 1) * 0.10;
    }
  }

  arrayTimer(): number {
    return (this.channels.length * 100) + 50;
  }
}
