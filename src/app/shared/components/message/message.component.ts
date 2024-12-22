import { Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild, viewChild } from '@angular/core';
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
import { collection, DocumentData, Firestore, onSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { ReactionInterface } from '../../interfaces/reaction-interface';
import { MessageParserService } from '../../services/message-parser.service';
import { Message } from '../../../models/message.class';
import { TextareaServiceService } from '../../services/textarea-service/textarea-service.service';
import { MentionUserInterface } from '../../interfaces/mention-user-interface';
import { ViewportService } from '../../services/viewport.service';
import { FirestoreService } from '../../services/firebase-services/firestore.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';

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
export class MessageComponent implements OnInit, OnDestroy {
  viewportService = inject(ViewportService);
  authService = inject(AuthserviceService);
  mesageparser = inject(MessageParserService);
  firebaseMessenger = inject(FirebaseMessengerService);
  threadService = inject(ThreadService);
  messengerService = inject(MessengerService);
  firestore = inject(Firestore);
  textareaService = inject(TextareaServiceService);
  firestoreService: FirestoreService = inject(FirestoreService);

  @Input() message = new Message;
  @Input() messageIndex: number;
  @Input() reduceContent: boolean;
  @Input() editAnswerMessage: boolean;
  @Input() sourceThread: boolean;

  @ViewChild('nameHeadline') nameHeadline: ElementRef;

  reactions: ReactionInterface[] = [];
  answers: MessageInterface[] = [];
  mentionedUsers: any[] = [];
  lastTwoReactins: any[] = [];
  usersToMention: MentionUserInterface[] = [];
  usersListAll: UserInterface[] = [];
  senderUser: UserInterface[] = [];

  hoveredMessageId: number;
  editMessageId: number;
  windowWith: number;
  editMessage: boolean;
  showDate: boolean;
  messageName: string;
  resizeObserver!: ResizeObserver;

  unsubReactionList: any;
  unsubAnswersList: any;
  unsubMentionsList: any;
  unsubAnswerList: any;
  userListSubscription: any;
  unsubChannelList: any;

  isTextWrapped = false;
  checkTextSenderName = false;
  openRestReactions = false;
  hoveredMenu = false;
  showEmojiBoard = false;


  /**
   * Lifecycle hook that is called after data-bound properties
   * of a directive are initialized.
   * It is used to:
   *  - get data of the user that sent the message
   *  - check if the date of the message is already included in the array of dates
   *  - subscribe to the list of reactions of the message
   *  - subscribe to the list of answers of the message
   *  - scroll to the bottom of the message container
   */
  ngOnInit(): void {
    this.getDataOfUser();
    this.messageName = this.senderUser[0].username;
    if (this.messengerService.channel.channelID !== '') {
      this.unsubMentionsList = this.subMentionsList();
    }
    this.checkDateIfAlreadyIncludeInArray();
    this.unsubReactionList = this.subReactionList();
    this.unsubAnswersList = this.subAnswersList(() => {
      setTimeout(() => {
        this.messengerService.scrollToBottom(this.messengerService.scrollContainer);
      }, 10);
    });
  }


  /**
 * Angular lifecycle hook that is called after the component's view has been fully initialized.
 * This function sets up a ResizeObserver to monitor the size of the element with the selector
 * `#nameHeadline` and calls the `checkTextStatus` method whenever the element's size changes.
 * The `checkTextStatus` method checks if the text of the element is wrapped and adjusts the
 * sender's name accordingly.
 */
  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.checkTextStatus());
    this.resizeObserver.observe(this.nameHeadline.nativeElement);
  }


  /**
   * Retrieves the data of the user that sent the message and stores it in the senderUser property.
   * If the sender of the message is a guest, it creates a fake user object with the given senderID and senderName.
   * The retrieved user data is stored in the `senderUser` property.
   */
  getDataOfUser(): void {
    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      this.usersListAll = users;
    });
    if (this.message.senderName !== 'Neuer Gast') {
      this.senderUser = this.usersListAll.filter(user => user.userID === this.message.senderID);
    } else {
      this.getCleanSenderUserJson()
    }
  }


  /**
   * Creates a clean user object for a guest user with the sender's ID and name.
   * This function generates a placeholder user object with empty fields for
   * password, email, and userStatus, while setting the userID, username, and
   * avatar to the sender's information. The resulting object is stored in the
   * `senderUser` property.
   */
  getCleanSenderUserJson(): void {
    this.senderUser = [
      {
        userID: this.message.senderID,
        password: '',
        email: '',
        username: this.message.senderName,
        avatar: this.message.senderAvatar,
        userStatus: '',
        isFocus: false,
      }
    ];
  }


  /**
   * Checks if the text of the element with the selector `#nameHeadline` is wrapped.
   * If the text is wrapped and the sender's name has not yet been shortened, it
   * calls the `getShortVersionOfName` method to shorten the name. If the text is
   * not wrapped and the sender's name has been shortened, it sets the name back to
   * the full name.
   * @private
   */
  checkTextStatus(): void {
    if (!this.editMessage) {
      const element = this.nameHeadline.nativeElement;
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight || '0');
      const elementHeight = element.offsetHeight;
      this.isTextWrapped = elementHeight > lineHeight;
      if (this.isTextWrapped && !this.checkTextSenderName) {
        this.getShortVersionOfName();
      } else if (this.windowWith < this.viewportService.width) {
        this.messageName = this.senderUser[0].username;
        this.checkTextSenderName = false;
      }
    }
  }


  /**
   * Shortens the sender's name if the text in the headline of a message is wrapped.
   * The shortened name is the first word of the user's name, followed by the first
   * letter of the second word. Saves the current width of the window and sets a
   * flag to indicate that the name has been shortened.
   * @private
   */
  getShortVersionOfName(): void {
    this.windowWith = this.viewportService.width;
    this.checkTextSenderName = true;
    this.messageName = `${this.messengerService.getFirstWord(this.senderUser[0].username)}. ${this.messengerService.getSecondWordFirstLetter(this.senderUser[0].username)}`;
  }


  /**
   * Determines how many reactions to display based on the width of the viewport.
   * If the user is viewing the thread in the side nav (i.e. `sourceThread` is true),
   * the number of reactions to display is determined by the
   * `numberOfReactionsOver1550` method. Otherwise, the number of reactions is
   * determined by the `numberOfReactionsOver1300` method.
   * @returns The number of reactions to display.
   */
  howManyReactionsToDisplay(): number {
    if (this.sourceThread) {
      return this.numberOfReactionsOver1550();
    } else {
      return this.numberOfReactionsOver1300();
    }
  }


  /**
   * Determines how many reactions to display based on the width of the viewport.
   * Returns 5 if the viewport width is 1550 or greater, 10 if it is between
   * 1140 and 1550, 6 if it is between 1020 and 1140, 8 if it is between 605 and 1020,
   * and 3 if it is less than 605.
   * @returns The number of reactions to display.
   */
  numberOfReactionsOver1550(): number {
    if (this.viewportService.width >= 1550) {
      return 5;
    } else if (this.viewportService.width < 1550 && this.viewportService.width >= 1140) {
      return 10;
    } else if (this.viewportService.width < 1140 && this.viewportService.width >= 1020) {
      return 6;
    } else if (this.viewportService.width < 1020 && this.viewportService.width >= 605) {
      return 8;
    } else {
      return 3;
    }
  }


  /**
   * Determines how many reactions to display based on the width of the viewport.
   * Returns 10 if the viewport width is 1300 or greater, 5 if it is between
   * 1020 and 1300, 10 if it is between 720 and 1020, 4 if it is between 380 and 720,
   * and 3 if it is less than 380.
   * @returns The number of reactions to display.
   */
  numberOfReactionsOver1300(): number {
    if (this.viewportService.width >= 1300) {
      return 10;
    } else if (this.viewportService.width < 1300 && this.viewportService.width >= 1020) {
      return 5;
    } else if (this.viewportService.width < 1020 && this.viewportService.width >= 720) {
      return 10;
    } else if (this.viewportService.width < 720 && this.viewportService.width >= 380) {
      return 4;
    } else {
      return 3;
    }
  }


  /**
   * Formats a given date string based on its relation to the current date and a specified place.
   * 
   * The function calculates and formats the current date and yesterday's date into a 'd. MMMM yyyy' format.
   * It also formats the given date string into both 'd. MMMM yyyy' and 'd. MMMM' formats.
   * These formatted date strings are then used in a function to check and return a text representation
   * based on the place parameter.
   *
   * @param date - The date string to be formatted.
   * @param place - A string indicating the location or context for date formatting.
   * @returns A string representation of the date based on the specified place.
   */
  giveDateBack(date: string, place: string): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDateTillYear = formatDate(yesterday, 'd. MMMM yyyy', 'de');
    const todayDateTillYear = formatDate(new Date(), 'd. MMMM yyyy', 'de');
    const messageDateTillYear = formatDate(date, 'd. MMMM yyyy', 'de',);
    const messageDateTillMonth = formatDate(date, 'd. MMMM', 'de');
    return this.ceckWhichTxt(place, yesterdayDateTillYear, todayDateTillYear, messageDateTillYear, messageDateTillMonth);
  }


  /**
   * Determines the appropriate text representation of a date based on its comparison with today's and yesterday's date.
   * 
   * Depending on the 'place' parameter, the function returns the date in lowercase or capitalized form.
   * If the message date is the same as today's date, it returns 'heute' or 'Heute'.
   * If the message date is the same as yesterday's date, it returns 'gestern' or 'Gestern'.
   * Otherwise, it returns the formatted date string, either prefixed with 'am' or not, based on the 'place' parameter.
   *
   * @param place - A string indicating the context for formatting ('answerText' for lowercase, others for capitalized).
   * @param yesterdayDateTillYear - The formatted string of yesterday's date in 'd. MMMM yyyy' format.
   * @param todayDateTillYear - The formatted string of today's date in 'd. MMMM yyyy' format.
   * @param messageDateTillYear - The formatted string of the message's date in 'd. MMMM yyyy' format.
   * @param messageDateTillMonth - The formatted string of the message's date in 'd. MMMM' format.
   * @returns A string representing the date in relation to today or yesterday, or a formatted date string.
   */
  ceckWhichTxt(place: string, yesterdayDateTillYear: string, todayDateTillYear: string, messageDateTillYear: string, messageDateTillMonth: string): string {
    if (messageDateTillYear == todayDateTillYear) {
      return place === 'answerText' ? 'heute' : 'Heute';
    } else if (yesterdayDateTillYear == messageDateTillYear) {
      return place === 'answerText' ? 'gestern' : 'Gestern';
    } else {
      return place === 'answerText' ? `am ${messageDateTillMonth}` : messageDateTillMonth;
    }
  }


  /**
   * Checks if the message date is already included in the messageDates array.
   *
   * Formats the message date into 'd. MMMM yyyy' format and checks if it is already
   * present in the messengerService's messageDates array. If not present, adds the formatted
   * date to the array and sets the showDate flag to true. Otherwise, sets the showDate flag to false.
   */
  checkDateIfAlreadyIncludeInArray(): void {
    const messageDateTillYear = formatDate(this.message.date, 'd. MMMM yyyy', 'de',);
    if (!this.messengerService.messageDates.includes(messageDateTillYear)) {
      this.messengerService.messageDates.push(messageDateTillYear);
      this.showDate = true;
    } else {
      this.showDate = false;
    }
  }


  /**
   * Returns the parsed message content.
   *
   * If the component is in edit mode for answer messages, it returns the
   * original message content without any parsing. Otherwise, it invokes the
   * message parser service to parse the answer content from the firebase
   * messenger and returns the parsed result.
   *
   * @param message - The original message content.
   * @returns The parsed message content or the original message if in edit mode.
   */
  getParsedMessage(message: string): string {
    if (this.editAnswerMessage) {
      return message;
    }
    return this.mesageparser.parseMessage(this.message.content);
  }


  /**
   * Returns the appropriate text representation of the number of answers to a message.
   * 
   * If there are no answers, returns 'Antworten'. If there is one answer, returns '1 Antwort'.
   * Otherwise, returns the number of answers with an 'n' appended.
   * @returns A string indicating the number of answers to a message.
   */
  giveAnswerLengthBack(): string {
    if (this.answers.length == 0) {
      return `Antworten`;
    } else if (this.answers.length == 1) {
      return `${this.answers.length} Antwort`;
    } else {
      return `${this.answers.length} Antworten`;
    }
  }


  /**
   * Returns the date of the last answer in the answers array.
   * 
   * If there are no answers, returns undefined. Otherwise, returns the date 
   * of the last answer as a string.
   * 
   * @returns The date of the last answer as a string, or undefined if there are no answers.
   */
  giveLastAnswerDateBack(): string | undefined {
    if (this.answers.length == 0) {
      return;
    } else {
      return `${this.answers[this.answers.length - 1].date}`;
    }
  }


  /**
   * Subscribes to the reaction list of a message with the given ID. When there is a change in the list, it will update the reactions array.
   * @returns An unsubscribe function that can be used to stop listening to the reaction list.
   */
  subReactionList(): any {
    const messegeRef = collection(this.firestore, `${this.firebaseMessenger.checkCollectionChatOrChannel()}/${this.firebaseMessenger.checkDocChatIDOrChannelID()}/messages/${this.message.messageID}/reactions`)
    return onSnapshot(messegeRef, (list) => {
      this.reactions = [];
      list.forEach(element => {
        this.reactions.push(this.setRectionObject(element.data(), element.id));
      });
      this.getNearestTwoReactions();
    })
  }


  /**
   * Sorts the reactions array to find the two reactions closest in time to the current date.
   * 
   * The method calculates the absolute difference between the current time and each reaction's
   * latest reaction time, sorts the reactions by this difference, and stores the result in 
   * `lastTwoReactins`.
   * 
   * @returns void
   */
  getNearestTwoReactions(): void {
    const now = Date.now();
    this.lastTwoReactins = this.reactions.sort((a, b) => {
      return Math.abs(a.latestReactionTime - now) - Math.abs(b.latestReactionTime - now);
    });
  }


  /**
   * Subscribes to the mention list of a message with the given ID. When there is a change in the list, it will update the mentionedUsers array.
   * @returns An unsubscribe function that can be used to stop listening to the mention list.
   */
  subMentionsList(): any {
    const messegeRef = collection(this.firestore, `channels/${this.messengerService.channel.channelID}/messages/${this.message.messageID}/mentions`)
    return onSnapshot(messegeRef, (list) => {
      this.mentionedUsers = [];
      list.forEach(element => {
        this.mentionedUsers.push(this.setMentionedObject(element.data(), element.id));
      });
    })
  }


  /**
   * Constructs a mentioned user data object from the provided user and avatar URL.
   * 
   * The returned object includes default values for avatar, userID, and userName fields.
   * 
   * @param element - is the array in the Firebase where the messages are saved
   * @param id - the ID of the message
   * @returns an object with the mentioned user's data
   */
  setMentionedObject(element: any, id: string): object {
    return {
      mentionedID: id || '',
      avatar: element.avatar || 'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a',
      userID: element.userID || '',
      userName: element.userName || '',
    }
  }


  /**
   * Constructs a ReactionInterface object using the provided element and id.
   * 
   * This function extracts the reaction content, sender IDs, sender names, 
   * and latest reaction time from the given element. It assigns the provided
   * id to the reactionID field and uses the message ID from the current message.
   * 
   * @param element - The source object containing reaction data.
   * @param id - The unique identifier for the reaction.
   * @returns A ReactionInterface object with the extracted and assigned data.
   */
  setRectionObject(element: any, id: string): ReactionInterface {
    return {
      reactionID: id || '',
      content: element.content || '',
      senderIDs: element.senderIDs || '',
      senderNames: element.senderNames || '',
      messageID: this.message.messageID || '',
      latestReactionTime: element.latestReactionTime || '',
    }
  }


  /**
   * Subscribes to the answers list of a message with the given ID and updates the answers array.
   * 
   * This function sets up a real-time listener on the answers collection of a specific message,
   * updating the local answers array whenever the data changes. It sorts the answers by date
   * after fetching them and executes an optional callback function if provided.
   * 
   * @param callback - An optional function to be executed after updating the answers array.
   * @returns An unsubscribe function that can be used to stop listening to the answers list.
   */
  subAnswersList(callback?: any): any {
    const messegeRef = collection(this.firestore, `${this.firebaseMessenger.checkCollectionChatOrChannel()}/${this.firebaseMessenger.checkDocChatIDOrChannelID()}/messages/${this.message.messageID}/answers`)
    return onSnapshot(messegeRef, (list) => {
      this.answers = [];
      list.forEach(element => {
        this.answers.push(this.firebaseMessenger.setMessageObject(element.data(), element.id));
      });
      this.firebaseMessenger.sortByDate(this.answers);

      if (callback) {
        return callback();
      }
    })
  }


  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Disconnects the ResizeObserver for the message and unsubscribes from the reaction list.
   */
  ngOnDestroy(): void {
    this.unsubReactionList;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }


  /**
   * Sets the visibility of the emoji board and toggles its state.
   *
   * This method updates the `showEmojiBoard` field based on the provided
   * boolean parameter and then calls `openOrCloseEmojiBoard` to toggle the
   * emoji board state. It also sets the `showDate1Count` flag in the
   * messenger service to false.
   *
   * @param showEmoijBoard - A boolean indicating the desired visibility
   * state of the emoji board.
   */
  getBoolean(showEmoijBoard: boolean): void {
    this.showEmojiBoard = showEmoijBoard;
    this.openOrCloseEmojiBoard();
    this.messengerService.showDate1Count = false;
  }


  /**
   * Toggles the visibility of the emoji board.
   *
   * If the emoji board is currently not visible, it sets its visibility to true.
   * If the emoji board is currently visible, it sets its visibility to false.
   */
  openOrCloseEmojiBoard(): void {
    if (this.showEmojiBoard == false) {
      this.showEmojiBoard = true;
    } else {
      this.showEmojiBoard = false;
    }
  }


  /**
   * When we hover the variable get changing
   */
  showOrHideMenu(): void {
    if (this.hoveredMenu == false) {
      this.hoveredMenu = true;
    } else {
      this.hoveredMenu = false;
    }
  }


  /**
   * Opens a thread based on the message.
   *
   * This method is used to open a thread when a message is clicked.
   * It sets the `openThreadContent` and `showThreadSideNav` flags to true in the
   * thread service and sets the `messageToReplyTo` property to the current
   * message. It then calls the `getDataOfUser` method in the thread service
   * to retrieve the data of the user who sent the message. Finally, it subscribes
   * to the reaction list of the message and scrolls to the bottom of the thread
   * side nav.
   */
  openThread():void {
    this.setBooleansForThread();
    this.threadService.messageToReplyTo = this.message;
    this.threadService.getDataOfUser();
    this.firebaseMessenger.subSomethingList(this.threadService.messageToReplyTo.messageID, 'answer', () => {
      setTimeout(() => {
        this.messengerService.scrollToBottom(this.threadService.scrollContainer);
      }, 10);
    });
    setTimeout(() => {
      if (this.messengerService.textareaThread) {
        this.messengerService.textareaThread.next();
      }
    }, 20);
  }


  /**
   * Configures the initial boolean states for opening a thread.
   * 
   * This method resets the `openThreadContent` flag and clears the `messageDates` array.
   * It also determines the state of the `openMessenger` flag based on the viewport width.
   * A timeout is set to activate the `showThreadSideNav` and `openThreadContent` flags 
   * shortly after the initial configuration.
   */
  setBooleansForThread(): void {
    this.threadService.openThreadContent = false;
    this.messengerService.messageDates = [];
    if (this.viewportService.width <= 1550) {
      this.messengerService.openMessenger = false;
    }
    setTimeout(() => {
      this.threadService.showThreadSideNav = true;
      this.threadService.openThreadContent = true;
    }, 10);
  }


  /**
   * Hides the emoji board by setting its visibility to false.
   *
   * This method updates the `showEmojiBoard` field to `false`,
   * ensuring that the emoji board is not visible.
   */
  closeEmojiBoard(): void {
    this.showEmojiBoard = false;
  }


  /**
   * Close the edit window
   * @param closeEditMessage - the boolean we got from our child component (edit-message) 
   */
  closeEdit(closeEditMessage: boolean):void {
    this.editMessage = closeEditMessage;
  }
}
