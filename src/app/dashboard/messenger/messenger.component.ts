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
import { AddMembersComponent } from "../channels-userlist/dialog-channel/add-members/add-members.component";
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
  @ViewChild('content') scrollContainer: ElementRef;

  dialog = inject(MatDialog);
  authService = inject(AuthserviceService);
  firebaseMessenger = inject(FirebaseMessengerService);
  threadService = inject(ThreadService);
  messengerService = inject(MessengerService);

  messagesDates: string[] = [];
  
  unsubChatList: any;
  reversedMessge: any;
  dateContent: string;
  dateTodayString: string;
  hoveredMessage: number;
  hoveredMenu = false;
  sourceThread = false;
  isEditChannelOpen = false;
  editChannelIsOpen = false;

  showAddPerson = false;
  dateCount = 0;

  unsubChannelList: any;
  usersInChannel: MentionUserInterface[] = [];
  usersListAll: UserInterface[] = [];
  userListSubscription: any;

  showAddPersonDialogDirect = false;


  constructor(public datePipe: DatePipe) {
  }
  
  
  ngOnInit() {
    if (this.messengerService.openChannel) {
      this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
        this.usersListAll = users;
        this.unsubChannelList = this.subChannelList();
      });

    }
    this.messengerService.messageDates = [];
    this.firebaseMessenger.messages = [];
    this.firebaseMessenger.subSomethingList('noID', 'noCollection');
  }
  
  
  ngAfterViewInit() {
    this.messengerService.scrollContainer = this.scrollContainer; 
  }


  ngOnDestroy() {
    this.unsubChatList;
  }


  subChannelList() {
    const messegeRef = doc(collection(this.firestore, `channels`), this.messengerService.channel.channelID);
    return onSnapshot(messegeRef, (list) => {
      if (list.exists()) {
        this.usersInChannel = [];
        const usersIDs = list.data()['userIDs'];
        for (let i = 0; i < usersIDs.length; i++) {        
          const userID = usersIDs[i];
          const user = this.usersListAll.filter(user => user.userID === userID);
          this.usersInChannel.push(this.getCleanJson(user));
        }
      } else {
        console.error("doc is empty or doesn't exist");
      }
    })
  }


  getCleanJson(user: UserInterface[]) {
    let userJson = {
      avatar: user[0]['avatar'],
      userID: user[0]['userID'],
      userName: user[0]['username'],
      email: user[0]['email'],
      userStatus: user[0]['userStatus'],
    }
    return userJson;
  }


  chatOrChannelHeader(src: string) {
    if (this.messengerService.openChart) {
      return `${this.messengerService.user.username}`
    } else {
      return `# ${this.messengerService.channel.title}`
    }
  }


  check(messageDate: Date): string {
    const formattedMessageDate = formatDate(messageDate, 'd. MMMM', 'de',);
    return formattedMessageDate;
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

  openDialogShowPerson() {
    this.showAddPerson = !this.showAddPerson;
  }

  openDialogAddPerson() {
    this.showAddPersonDialogDirect = true;
    this.showAddPerson = !this.showAddPerson;

    // this.dialog.open(AddPersonComponent, {
    //   data: this.usersInChannel,
    //   panelClass: 'my-custom-dialog',
    // });
  }

  toggleEditChannel() {
    this.editChannelIsOpen = !this.editChannelIsOpen;
  }


  closeEditChannel() {
    this.editChannelIsOpen = false;
  }


  closeAddPerson() {
    this.showAddPerson = false;
  }
}
