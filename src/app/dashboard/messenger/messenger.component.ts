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
import { EditMessageComponent } from '../../shared/components/message/edit-message/edit-message.component';
import { MessageComponent } from '../../shared/components/message/message.component';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import localeDe from '@angular/common/locales/de';
import { EditChannelComponent } from './edit-channel/edit-channel.component';
import { OverlayModule } from '@angular/cdk/overlay';
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
    DetailPersonComponent,
    MatDialogModule,
    EditMessageComponent,
    MessageComponent,
    TextareaComponent,
    EditChannelComponent,
    OverlayModule
  ],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss'
})
export class MessengerComponent implements AfterViewInit {
  @ViewChild('content') scrollContainer: ElementRef;

  dialog = inject(MatDialog);
  authService = inject(AuthserviceService);

  messagesDates: string[] = [];

  dateContent: string;
  dateTodayString: string;

  hoveredMessage: number;
  dateCount: number = 0;

  hoveredMenu: boolean = false;
  sourceThread: boolean = false;
  isEditChannelOpen: boolean = false;
  editChannelIsOpen: boolean = false;

  unsubChatList: any;

  reversedMessge: any;
  // lastDisplayedDate: string = localStorage.getItem('lastDisplayedDate') || '';
  test: boolean;



  constructor(public firebaseMessenger: FirebaseMessengerService, public threadService: ThreadService, public messengerService: MessengerService, public datePipe: DatePipe) {
    this.messengerService.messageDates = [];
    firebaseMessenger.messages = [];
    this.unsubChatList = firebaseMessenger.subChatsList();

  }


  chatOrChannelHeader(src: string) {
    if (this.messengerService.openChart) {
      return `${this.messengerService.user.username}`
    } else {
      return `# ${this.messengerService.channel.title}`
    }
  }


  ngAfterViewInit() {
    setTimeout(() => {
      this.scrollToBottom();
    }, 500);
  }


  scrollTo() {
    setTimeout(() => {
      this.scrollToBottom();
    }, 10);
  }



  // transform(messages: any[], dateFormat: string = 'd. MMMM yyyy'): any[] {
  //   if (!messages || messages.length === 0) {
  //     return [];
  //   }

  //   const groupedMessages = [];
  //   let currentDate = null;

  //   for (const message of messages) {
  //     const messageDate = new Date(message.timestamp); // Annahme: Deine Nachrichten haben ein timestamp-Feld
  //     const formattedDate = formatDate(messageDate, dateFormat, 'de'); // 'de' für deutsche Lokalisierung

  //     if (formattedDate !== currentDate) {
  //       groupedMessages.push({ date: formattedDate, messages: [] });
  //       currentDate = formattedDate;
  //     }

  //     groupedMessages[groupedMessages.length - 1].messages.push(message);
  //   }

  //   return groupedMessages;
  // }


  scrollToBottom() {
    this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
  }


  check(messageDate: Date): string {
    const formattedMessageDate = formatDate(messageDate, 'd. MMMM', 'de',);
    return formattedMessageDate;
  }


  checkDate(messageDate: Date) {
    const formattedTodayDate = formatDate(new Date(), 'd. MMMM', 'de');
    const formattedMessageDate = formatDate(messageDate, 'd. MMMM', 'de',);
    console.log(formattedMessageDate);

    if (formattedTodayDate == formattedMessageDate) {
      this.messagesDates.push(formattedMessageDate);

      // if(this.messagesDates.includes(formattedMessageDate)) {
      //   console.log(this.test);
      //   console.log(this.messagesDates);
      //   console.log('Date Message', formattedMessageDate);
      //   return 'Heute';
      // } else {
      //   return '';
      // }
    } else {
      return;
    }








    // setTimeout(() => {
    //   const formatter = new Intl.DateTimeFormat('de-DE', { dateStyle: 'short' });
    //   this.dateTodayString = formatter.format(new Date());
    //   const dateMessageString = formatter.format(messageDate);
    //   if (this.dateTodayString !== this.lastDisplayedDate) {
    //     this.lastDisplayedDate = this.dateTodayString;
    //     localStorage.setItem('lastDisplayedDate', this.dateTodayString);
    //     return 'HJKH';
    //   } else {
    //     return;
    //     // this.datePipe.transform(messageDate, 'EEEE, MMMM d')
    //   }

    // },1000);
  }


  ngOnDestroy() {
    this.unsubChatList;
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
      panelClass: 'my-custom-dialog'
    });
  }

  toggleEditChannel() {
    this.editChannelIsOpen = !this.editChannelIsOpen;
  }

  closeEditChannel() {
    this.editChannelIsOpen = false;
  }
}
