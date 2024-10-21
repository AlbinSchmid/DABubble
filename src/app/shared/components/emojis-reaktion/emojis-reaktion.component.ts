import { Component, inject, Input } from '@angular/core';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../services/messenger-service/messenger.service';
import { CommonModule } from '@angular/common';
import { MessageInterface } from '../../interfaces/message-interface';
import { ReactionInterface } from '../../interfaces/reaction-interface';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';

@Component({
  selector: 'app-emojis-reaktion',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './emojis-reaktion.component.html',
  styleUrl: './emojis-reaktion.component.scss'
})
export class EmojisReaktionComponent {
  authService = inject(AuthserviceService);
  @Input() reaction: ReactionInterface = {
    content: '',
    senderIDs: [],
    senderNames: [],
    messageID: '',
    reactionID: '',
  };
  @Input() index: number;
  userUsedThisReactionAlready: boolean;

  constructor(public firebaseMessenger: FirebaseMessengerService, private messengerService: MessengerService) {
  }


  ngOnInit() {
    for (let i = 0; i < this.reaction.senderIDs.length; i++) {
      const senderIDs = this.reaction.senderIDs[i];
      if (this.authService.currentUserSig()?.userID == senderIDs) {
        this.userUsedThisReactionAlready = true;
      } else {
        this.userUsedThisReactionAlready = false;
      }
    }
  }

  addSameReaktion() {
    for (let i = 0; i < this.reaction.senderIDs.length; i++) {
      const senderIDs = this.reaction.senderIDs[i];
      if (this.authService.currentUserSig()?.userID !== senderIDs) {
        this.reaction.senderIDs.push(this.authService.currentUserSig()?.userID || '');
        this.reaction.senderNames.push(this.authService.currentUserSig()?.username || '');
        this.firebaseMessenger.updateReaktion(this.reaction, this.reaction.messageID ,this.reaction.reactionID); 
      } 
    }
  }
}
