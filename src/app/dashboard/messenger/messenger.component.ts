import { AfterContentInit, AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild, viewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DetailPersonComponent } from './detail-person/detail-person.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ThreadService } from '../../shared/services/thread-service/thread.service';
import { FirebaseMessengerService } from '../../shared/services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../shared/services/messenger-service/messenger.service';
import { EditMessageComponent } from '../../shared/components/message/edit-message/edit-message.component';
import { MessageComponent } from '../../shared/components/message/message.component';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';

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
  ],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss'
})
export class MessengerComponent implements AfterViewInit {
  dialog = inject(MatDialog);
  authService = inject(AuthserviceService);
  hoveredMessage: number;
  hoveredMenu = false;
  sourceThread = false;
  dateCount = 0;
  unsubChatList;
  dateContent: string;
  dateTodayString: string;
  reversedMessge: any;
  @ViewChild('content') scrollContainer: ElementRef;
  lastDisplayedDate: string = localStorage.getItem('lastDisplayedDate') || '';

 
  constructor(public firebaseMessenger: FirebaseMessengerService, public threadService: ThreadService, public messengerService: MessengerService, public datePipe: DatePipe) {
    this.unsubChatList = firebaseMessenger.subChatsList();
  }


  ngAfterViewInit() {
    setTimeout(() => {
      this.scrollToBottom();
    }, 500);
  }
  

  scrollTo() {
    setTimeout(() => {
      this.scrollToBottom();
    },10);
    
  }


  scrollToBottom() {
    this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
  }


  checkDate(messageDate: Date) {    
    setTimeout(() => {
      const formatter = new Intl.DateTimeFormat('de-DE', { dateStyle: 'short' });
      this.dateTodayString = formatter.format(new Date());
      const dateMessageString = formatter.format(messageDate);
      if (this.dateTodayString !== this.lastDisplayedDate) {
        this.lastDisplayedDate = this.dateTodayString;
        localStorage.setItem('lastDisplayedDate', this.dateTodayString);
        return 'HJKH';
      } else {
        return;
        // this.datePipe.transform(messageDate, 'EEEE, MMMM d')
      }
      
    },1000);
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
}
