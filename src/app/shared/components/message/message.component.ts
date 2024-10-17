import { Component, inject, Input } from '@angular/core';
import { ThreadService } from '../../services/thread-service/thread.service';
import { EditMessageComponent } from './edit-message/edit-message.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Message } from '../../interfaces/message';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { EmojisReaktionComponent } from '../emojis-reaktion/emojis-reaktion.component';
import { EmojiBoardComponent } from '../emoji-board/emoji-board.component';
import { FormsModule } from '@angular/forms';
import { MessengerService } from '../../services/messenger-service/messenger.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    EditMessageComponent,
    CommonModule,
    MatIconModule,
    EmojisReaktionComponent,
    EmojiBoardComponent,
    FormsModule,
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  authService = inject(AuthserviceService);
  @Input() message: Message = {
    content: '',
    isRead: false,
    senderId: '',
    senderName: '',
    senderAvatar: '',
    date: 0,
    type: '',
    id: '',
  };
  @Input() messageIndex: number;
  @Input() reduceContent: boolean;
  @Input() editAnswerMessage: boolean;
  @Input() sourceThread: boolean;
  hoveredMenu = false;
  showEmojiBoard = false;
  hoveredMessageId: number;
  editMessageId: number;
  editMessage: boolean;
  unsubReaktionList: any;


  constructor(public firebaseMessenger: FirebaseMessengerService, public threadService: ThreadService, public messengerService: MessengerService) {
    setTimeout(() => {
      messengerService.messageId = this.message.id
      this.unsubReaktionList = firebaseMessenger.subReactionList();
      console.log('messageID is', messengerService.messageId);
    },);
  }


  ngOnDestroy() {
    this.unsubReaktionList;
  }


  getBoolean(showEmoijBoard: boolean) {
    this.showEmojiBoard = showEmoijBoard;
    this.openOrCloseEmojiBoard();
  }


  openOrCloseEmojiBoard() {
    if (this.showEmojiBoard == false) {
      this.showEmojiBoard = true;
    } else {
      this.showEmojiBoard = false;
    }
  }


  /**
   * When we hover the variable get changing
   */
  showOrHideMenu() {
    if (this.hoveredMenu == false) {
      this.hoveredMenu = true;
    } else {
      this.hoveredMenu = false;
    }
  }


  /**
   * Open the thread for answer
   */
  openThead() {
    this.threadService.showThread = false;
    this.threadService.messageId = this.message.id;
    this.threadService.answeredMessage = this.message;
    this.threadService.senderName = this.message.senderName;
    this.threadService.senderAvatar = this.message.senderAvatar;
    setTimeout(() => {
      this.threadService.showThread = true;
    }, 10);
  }


  closeEmojiBoard() {
    this.showEmojiBoard = false;
  }


  /**
   * Close the edit window
   * @param closeEditMessage - the boolean we got from our child component (edit-message) 
   */
  closeEdit(closeEditMessage: boolean) {
    this.editMessage = closeEditMessage;
  }
}
