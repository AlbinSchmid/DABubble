import { Component, inject, Input } from '@angular/core';
import { ThreadService } from '../../services/thread-service/thread.service';
import { EditMessageComponent } from './edit-message/edit-message.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { EmojisReaktionComponent } from '../emojis-reaktion/emojis-reaktion.component';
import { EmojiBoardComponent } from '../emoji-board/emoji-board.component';
import { FormsModule } from '@angular/forms';
import { MessengerService } from '../../services/messenger-service/messenger.service';
import { MessageInterface } from '../../interfaces/message-interface';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';
import { ReactionInterface } from '../../interfaces/reaction-interface';
import { MessageParserService } from '../../services/message-parser.service';

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
  mesageparser = inject(MessageParserService);
  firebaseMessenger = inject(FirebaseMessengerService);
  threadService = inject(ThreadService);
  messengerService = inject(MessengerService);
  firestore: Firestore = inject(Firestore);
  @Input() message: MessageInterface = {
    content: '',
    isRead: false,
    senderId: '',
    senderName: '',
    senderAvatar: '',
    date: 0,
    type: '',
    id: '',
    reactions: {
      content: '',
      senderIDs: '',
      senderNames: '',
      messageID: '',
    }
  };
  @Input() messageIndex: number;
  @Input() reduceContent: boolean;
  @Input() editAnswerMessage: boolean;
  @Input() sourceThread: boolean;
  reactions: ReactionInterface[] = [];
  answers: MessageInterface[] = [];
  hoveredMenu = false;
  showEmojiBoard = false;
  hoveredMessageId: number;
  editMessageId: number;
  editMessage: boolean;
  unsubReactionList: any;
  unsubAnswersList: any;


  getParsedMessage(message: string) {
    return this.mesageparser.parseMessage(this.message.content);
  }


  giveAnswerLengthBack() {
    if (this.answers.length == 0) {
      return `Antworten`;
    } else if (this.answers.length == 1) {
      return `${this.answers.length} Antwort`;
    } else {
      return `${this.answers.length} Antworten`;
    }
  }


  giveLastAnswerDateBack() {
    if (this.answers.length == 0) {
      return;
    } else {
      return `${this.answers[this.answers.length - 1].date}`;
    }
  }


  ngOnInit() {
    this.unsubReactionList = this.subReactionList();
    this.unsubAnswersList = this.subAnswersList();
  }


  subReactionList() {
    const messegeRef = collection(this.firestore, `chats/${this.messengerService.chartId}/messeges/${this.message.id}/reactions`)
    return onSnapshot(messegeRef, (list) => {
      this.reactions = [];
      list.forEach(element => {
        this.reactions.push(this.setRectionObject(element.data(), element.id));
      });
    })
  }


  setRectionObject(element: any, id: string) {
    return {
      reactionID: id || '',
      content: element.content || '',
      senderIDs: element.senderIDs || '',
      senderNames: element.senderNames || '',
      messageID: this.message.id || '',
    }
  }


  subAnswersList() {
    const messegeRef = collection(this.firestore, `chats/${this.messengerService.chartId}/messeges/${this.message.id}/answers`)
    return onSnapshot(messegeRef, (list) => {
      this.answers = [];
      list.forEach(element => {
        this.answers.push(this.firebaseMessenger.setMessageObject(element.data(), element.id));
      });
      this.firebaseMessenger.sortByDate(this.answers);
      console.log(this.answers[3]);
      
    })
  }


  ngOnDestroy() {
    this.unsubReactionList;
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
