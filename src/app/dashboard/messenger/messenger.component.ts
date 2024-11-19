import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DetailPersonComponent } from './detail-person/detail-person.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, formatDate, registerLocaleData } from '@angular/common';
import { ThreadService } from '../../shared/services/thread-service/thread.service';
import { FirebaseMessengerService } from '../../shared/services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../shared/services/messenger-service/messenger.service';
import { MessageComponent } from '../../shared/components/message/message.component';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import localeDe from '@angular/common/locales/de';
import { EditChannelComponent } from './edit-channel/edit-channel.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { collection, doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { UserInterface } from '../../landing-page/interfaces/userinterface';
import { FirestoreService } from '../../shared/services/firebase-services/firestore.service';
import { MentionUserInterface } from '../../shared/interfaces/mention-user-interface';
import { AddPersonComponent } from './add-person/add-person.component';
import { list } from '@angular/fire/storage';
import { UserInChannel } from '../../models/mentioned-user.class';
registerLocaleData(localeDe);

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MessageComponent,
    TextareaComponent,
    EditChannelComponent,
    OverlayModule,
    AddPersonComponent
  ],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss'
})
export class MessengerComponent implements AfterViewInit {
  firestore: Firestore = inject(Firestore);
  firestoreService: FirestoreService = inject(FirestoreService);
  dialog = inject(MatDialog);
  datePipe = inject(DatePipe);
  authService = inject(AuthserviceService);
  firebaseMessenger = inject(FirebaseMessengerService);
  threadService = inject(ThreadService);
  messengerService = inject(MessengerService);

  @ViewChild('content') scrollContainer: ElementRef;

  messagesDates: string[] = [];
  usersListAll: UserInterface[] = [];
  // usersInChannel = new UserInChannel();
  usersInChannel: UserInterface[] = [];

  userListSubscription: any;
  unsubChannelList: any;
  reversedMessge: any;
  dateContent: string;
  dateTodayString: string;
  hoveredMessage: number;
  hoveredMenu = false;
  sourceThread = false;
  isEditChannelOpen = false;
  editChannelIsOpen = false;
  showAddPerson = false;
  showAddPersonDialogDirect = false;
  dateCount = 0;


  /**
  * Initializes the component by checking if a channel is open and retrieves the users of the channel.
  * Resets the message dates and messages list in the messenger service and firebase messenger service, respectively.
  * Subscribes to a list with default parameters ('noID', 'noCollection') in the firebase messenger service.
  */
  ngOnInit() {
    if (this.messengerService.openChannel) {
      this.getTheUsersOfChannel();
      // this.usersInChannel.getTheUsersOfChannel();
    }
    this.messengerService.messageDates = [];
    this.firebaseMessenger.messages = [];
    this.firebaseMessenger.subSomethingList('noID', 'noCollection');
  }


  /**
   * Sets the scrollContainer in the messenger service to the ElementRef of the ViewChild with the name 'content'.
   * This is necessary because the ViewChild is not yet available in the constructor or ngOnInit.
   */
  ngAfterViewInit() {
    this.messengerService.scrollContainer = this.scrollContainer;
  }


  /**
   * Unsubscribes from the channel user list and the list of all users when the component is destroyed.
   */
  ngOnDesroy() {
    this.unsubChannelList;
    this.userListSubscription;
  }


  /**
   * Retrieves the users of the currently open channel by subscribing to the channel user list observable.
   * It first subscribes to the list of all users and then filters this list by the user IDs stored in the channel user list.
   */
  getTheUsersOfChannel() {
    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      this.usersListAll = users;
      this.unsubChannelList = this.firebaseMessenger.subChannelUserList((list: any) => {
        this.usersInChannel = [];
        const usersIDs = list.data()['userIDs'];
        for (let i = 0; i < usersIDs.length; i++) {
          const userID = usersIDs[i];
          const user = this.usersListAll.filter(user => user.userID === userID);
          this.usersInChannel.push(this.firebaseMessenger.getCleanJson(user));
        }
      });
    });
  }


/**
 * Returns the header text based on the current context.
 * 
 * If the user is in a private chat, it returns the username of the chat partner.
 * If the user is in a channel, it returns the channel title prefixed with '#'.
 * 
 * @param {string} src - The source string (not used in the function).
 * @returns {string} - The username or channel title for the header.
 */
  chatOrChannelHeader(src: string):string {
    if (this.messengerService.openChart) {
      return `${this.messengerService.user.username}`
    } else {
      return `# ${this.messengerService.channel.title}`
    }
  }


  /**
   * We controll if the interaction menu should be hide or not
   */
  showOrHideMenu() {
    if (this.hoveredMenu == false) {
      this.hoveredMenu = true;
    } else {
      this.hoveredMenu = false;
    }
  }


  /**
   * Open the detail View of the channel or person
   */
  openDialog() {
    this.dialog.open(DetailPersonComponent, {
      data: {
        avatar: this.messengerService.user.avatar,
        userID: this.messengerService.user.userID,
        userName: this.messengerService.user.username,
        email: this.messengerService.user.email,
        userStatus: this.messengerService.user.userStatus
      },
    });
  }


/**
 * Toggles the visibility of the "Add Person" dialog.
 * Sets showAddPersonDialogDirect to true and toggles 
 * the showAddPerson state.
 */
  openDialogAddPersonDirect() {
    this.showAddPersonDialogDirect = true;
    this.showAddPerson = !this.showAddPerson;
  }
}
