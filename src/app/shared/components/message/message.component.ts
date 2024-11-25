import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ThreadService } from '../../services/thread-service/thread.service';
import { EditMessageComponent } from './edit-message/edit-message.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, formatDate } from '@angular/common';
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
import { Message } from '../../../models/message.class';
import { TextareaServiceService } from '../../services/textarea-service/textarea-service.service';
import { MentionUserInterface } from '../../interfaces/mention-user-interface';

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
export class MessageComponent implements OnInit {
  authService = inject(AuthserviceService);
  mesageparser = inject(MessageParserService);
  firebaseMessenger = inject(FirebaseMessengerService);
  threadService = inject(ThreadService);
  messengerService = inject(MessengerService);
  firestore: Firestore = inject(Firestore);
  textareaService = inject(TextareaServiceService);

  @Input() message = new Message;
  @Input() messageIndex: number;
  @Input() reduceContent: boolean;
  @Input() editAnswerMessage: boolean;
  @Input() sourceThread: boolean;

  reactions: ReactionInterface[] = [];
  answers: MessageInterface[] = [];
  mentionedUsers: any[] = [];
  lastTwoReactins: any[] = [];
  usersToMention: MentionUserInterface[] = [];

  hoveredMenu = false;
  showEmojiBoard = false;
  hoveredMessageId: number;
  editMessageId: number;
  editMessage: boolean;
  unsubReactionList: any;
  unsubAnswersList: any;
  unsubMentionsList: any;
  showDate: boolean;
  unsubAnswerList: any;

  unsubChannelList: any;


  ngOnInit() {
    if (this.messengerService.channel.channelID !== '') {
      this.unsubMentionsList = this.subMentionsList();
    }
    this.checkDateIfAlreadyIncludeInArray();
    this.unsubReactionList = this.subReactionList();
    this.unsubAnswersList = this.subAnswersList(); //Für die zahlen
  }


  giveDateBack(date: string, place: string) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDateTillYear = formatDate(yesterday, 'd. MMMM yyyy', 'de');
    const todayDateTillYear = formatDate(new Date(), 'd. MMMM yyyy', 'de');
    const messageDateTillYear = formatDate(date, 'd. MMMM yyyy', 'de',);
    const messageDateTillMonth = formatDate(date, 'd. MMMM', 'de');
    return this.ceckWhichTxt(place, yesterdayDateTillYear, todayDateTillYear, messageDateTillYear, messageDateTillMonth);
  }


  ceckWhichTxt(place: string, yesterdayDateTillYear: string, todayDateTillYear: string, messageDateTillYear: string, messageDateTillMonth: string) {
    if (messageDateTillYear == todayDateTillYear) {
      return place === 'answerText' ? 'heute' : 'Heute';
    } else if (yesterdayDateTillYear == messageDateTillYear) {
      return place === 'answerText' ? 'gestern' : 'Gestern';
    } else {
      return place === 'answerText' ? `am ${messageDateTillMonth}` : messageDateTillMonth;
    }
  }


  checkDateIfAlreadyIncludeInArray() {
    const messageDateTillYear = formatDate(this.message.date, 'd. MMMM yyyy', 'de',);
    if (!this.messengerService.messageDates.includes(messageDateTillYear)) {
      this.messengerService.messageDates.push(messageDateTillYear);
      this.showDate = true;
    } else {
      this.showDate = false;
    }
  }


  getParsedMessage(message: string) {
    if (this.editAnswerMessage) {
      return message;
    }
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


  subReactionList() {
    const messegeRef = collection(this.firestore, `${this.firebaseMessenger.checkCollectionChatOrChannel()}/${this.firebaseMessenger.checkDocChatIDOrChannelID()}/messages/${this.message.messageID}/reactions`)
    return onSnapshot(messegeRef, (list) => {
      this.reactions = [];
      list.forEach(element => {
        this.reactions.push(this.setRectionObject(element.data(), element.id));
      });
      this.getNearestTwoReactions();
    })
  }


  getNearestTwoReactions() {
    const now = Date.now();
    this.lastTwoReactins = this.reactions.sort((a, b) => {
      return Math.abs(a.latestReactionTime - now) - Math.abs(b.latestReactionTime - now);
    });
  }


  subMentionsList() {
    const messegeRef = collection(this.firestore, `channels/${this.messengerService.channel.channelID}/messages/${this.message.messageID}/mentions`)
    return onSnapshot(messegeRef, (list) => {
      this.mentionedUsers = [];
      list.forEach(element => {
        this.mentionedUsers.push(this.setMentionedObject(element.data(), element.id));
      });
      setTimeout(() => {
        this.messengerService.scrollToBottom(this.messengerService.scrollContainer);
      });
    })
  }


  setMentionedObject(element: any, id: string) {
    return {
      mentionedID: id || '',
      avatar: element.avatar || '',
      userID: element.userID || '',
      userName: element.userName || '',
    }
  }


  setRectionObject(element: any, id: string) {
    return {
      reactionID: id || '',
      content: element.content || '',
      senderIDs: element.senderIDs || '',
      senderNames: element.senderNames || '',
      messageID: this.message.messageID || '',
      latestReactionTime: element.latestReactionTime || '',
    }
  }


  subAnswersList() {
    const messegeRef = collection(this.firestore, `${this.firebaseMessenger.checkCollectionChatOrChannel()}/${this.firebaseMessenger.checkDocChatIDOrChannelID()}/messages/${this.message.messageID}/answers`)
    return onSnapshot(messegeRef, (list) => {
      this.answers = [];
      list.forEach(element => {
        this.answers.push(this.firebaseMessenger.setMessageObject(element.data(), element.id));
      });
      this.firebaseMessenger.sortByDate(this.answers);
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
    this.threadService.showThreadSideNav = true;
    this.threadService.messageToReplyTo = this.message;
    console.log(this.threadService.scrollContainer);
    this.firebaseMessenger.subSomethingList(this.threadService.messageToReplyTo.messageID, 'answer');
    setTimeout(() => {
      if (this.messengerService.textareaThread) {
        this.messengerService.textareaThread.next();
      }
    }, 20);
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
