import { Component, inject, Input, OnInit } from '@angular/core';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../services/messenger-service/messenger.service';
import { CommonModule } from '@angular/common';
import { ReactionInterface } from '../../interfaces/reaction-interface';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { ViewportService } from '../../services/viewport.service';

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
  viewportService = inject(ViewportService);
  authService = inject(AuthserviceService);
  firebaseMessenger = inject(FirebaseMessengerService);
  messengerService = inject(MessengerService);

  @Input() messageInteraction: boolean;
  @Input() reaction: ReactionInterface = {
    content: '',
    senderIDs: [],
    senderNames: [],
    messageID: '',
    reactionID: '',
    latestReactionTime: 0,
  };
  @Input() index: number;
  @Input() reactionIndex: number;
  @Input() reactionsArrayLength: number;

  userUsedThisReactionAlready: boolean;
  foundID: boolean;

  moreReactionsBtnIsAlreadyUsed = false;


  /**
   * Returns the border color for the reaction button based on whether the
   * current user has used the reaction already or not. If the user has used
   * the reaction, the border color is set to #444DF2 (a blue color). If the
   * user has not used the reaction, the border color is set to an empty string
   * (i.e. no border color is applied).
   * @returns The border color for the reaction button.
   */
  getBorderColor(): string | undefined {
    this.foundID = this.reaction.senderIDs.includes(this.authService.currentUserSig()?.userID ?? '');
    if (this.foundID) {
      return '#444DF2';
    } else {
      return
    }
  }


  /**
   * Determines the background color for the reaction button based on whether
   * the current user has used the reaction already. If the user has used the 
   * reaction, the background color is set to a light blue color 'rgba(68, 77, 242, 0.1)'. 
   * If the user has not used the reaction, no background color is applied.
   * @returns The background color for the reaction button.
   */
  getBackgroundColor(): string | undefined {
    this.foundID = this.reaction.senderIDs.includes(this.authService.currentUserSig()?.userID ?? '');
    if (this.foundID) {
      return 'rgba(68, 77, 242, 0.1)';
    } else {
      return
    }
  }


  /**
   * Checks if the current user has already used the reaction. If the user
   * has not used the reaction, adds the user to the reaction. If the user
   * has already used the reaction, removes the user from the reaction.
   * @returns void
   */
  alreadyExisitingReaktion(): void {
    if (!this.foundID) {
      this.addUserToReaction();
    } else {
      this.removeUserFromReaction();
    }
  }


  /**
   * Adds the current user to the reaction if the user has not already reacted
   * with the same reaction. If the user has not reacted with the same reaction
   * before, the user is added to the reaction and the reaction is updated in
   * the database.
   * @returns void
   */
  addUserToReaction(): void {
    if (!this.reaction.senderIDs.includes(this.authService.currentUserSig()?.userID ?? '')) {
      this.reaction.senderIDs.push(this.authService.currentUserSig()?.userID || '');
      this.reaction.senderNames.push(this.authService.currentUserSig()?.username || '');
      this.firebaseMessenger.updateSomethingAtMessage(this.reaction.messageID, 'reaction', this.reaction.reactionID, this.reaction);
    }
  }


  /**
   * Removes the current user from the reaction. If the user is the last one
   * to have reacted, deletes the reaction from the database. Otherwise, updates
   * the reaction in the database to reflect the removal of the user.
   * @returns void
   */
  removeUserFromReaction(): void {
    this.reaction.senderIDs.splice(this.reaction.senderIDs.indexOf(this.authService.currentUserSig()?.userID ?? ''), 1);
    this.reaction.senderNames.splice(this.reaction.senderNames.indexOf(this.authService.currentUserSig()?.username ?? ''), 1);
    if (this.reaction.senderIDs.length == 0) {
      this.firebaseMessenger.deleteReaction(this.reaction.messageID, this.reaction.reactionID);
    } else {
      this.firebaseMessenger.updateSomethingAtMessage(this.reaction.messageID, 'reaction', this.reaction.reactionID, this.reaction);
    }
  }


  /**
   * Checks if the current user has already reacted with the given reaction.
   * If the current user has reacted, returns 'haben reagiert' if there are
   * more than one users who have reacted with the same reaction, and
   * 'hast reagiert' if there is only one user (the current user) who has
   * reacted with the same reaction. If the current user has not reacted,
   * returns 'haben reagiert' if there are more than one users who have
   * reacted with the same reaction, and 'hast reagiert' if there is only
   * one user who has reacted with the same reaction.
   * @returns string
   */
  controllText(): string {
    this.foundID = this.reaction.senderIDs.includes(this.authService.currentUserSig()?.userID ?? '');
    if (this.foundID) {
      return this.reaction.senderNames.length > 1 ? 'haben reagiert' : 'hast reagiert';
    } else {
      return this.reaction.senderNames.length > 1 ? 'haben reagiert' : 'hast reagiert';
    }
  }


  /**
   * Returns a string which is either the name of the first user in the
   * senderNames array if the current user is not in the senderNames
   * array, or a string which is either the name of the first user in the
   * senderNames array if the current user is in the senderNames array and
   * there are more than one users who have reacted with the same reaction,
   * or the name of the first user in the senderNames array if the current
   * user is in the senderNames array and there is only one user who has
   * reacted with the same reaction.
   * @returns string
   */
  controllNamesArrayLength(): string {
    this.foundID = this.reaction.senderIDs.includes(this.authService.currentUserSig()?.userID ?? '');
    if (this.foundID) {
      return this.checkWichStringShouldGiveBack();
    } else {
      if (this.reaction.senderNames.length > 1) {
        return `${this.reaction.senderNames[0]} und ${this.reaction.senderNames.length - 1} weitere`
      } else {
        return `${this.reaction.senderNames[0]}`;
      }
    }
  }


  /**
   * Determines the string representation of the current user's reaction status.
   * If there are multiple users who have reacted, it returns a string indicating
   * "You and X others" or "You and [another user]", depending on the number of users.
   * If the current user is the only one who has reacted, it simply returns "You".
   * 
   * @returns {string} - A string representing the reaction status of the current user.
   */
  checkWichStringShouldGiveBack(): string {
    if (this.reaction.senderNames.length > 1) {
      if (this.reaction.senderNames.length > 2) {
        return `Du und ${this.reaction.senderNames.length - 1} weitere`
      } else {
        return this.reaction.senderNames[0] == this.authService.currentUserSig()?.username ? `Du und ${this.reaction.senderNames[1]}` : `Du und ${this.reaction.senderNames[0]}`;
      }
    } else {
      return 'Du';
    }
  }
}
