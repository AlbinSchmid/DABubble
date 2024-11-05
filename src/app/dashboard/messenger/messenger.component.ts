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
  dateCount = 0;


  constructor(public datePipe: DatePipe) {
    this.messengerService.messageDates = [];
    this.firebaseMessenger.messages = [];
    this.firebaseMessenger.subChatsList(() => {  
      setTimeout(() => {
        this.messengerService.scrollToBottom(this.scrollContainer);
      });
    });  
  }


  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.messengerService.scrollToBottom(this.scrollContainer);
      
    // }, 500);
  }


  ngOnDestroy() {
    this.unsubChatList;
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
