import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DetailPersonComponent } from './detail-person/detail-person.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { timestamp } from 'rxjs';
import { ThreadService } from '../../shared/services/thread-service/thread.service';
import { FirebaseMessengerService } from '../../shared/services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../shared/services/messenger-service/messenger.service';
import { EditMessageComponent } from '../../shared/components/message/edit-message/edit-message.component';
import { MessageComponent } from '../../shared/components/message/message.component';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
 
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
  ],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss'
})
export class MessengerComponent {
  dialog = inject(MatDialog);
  authService = inject(AuthserviceService);
  hoveredMessage: number;
  hoveredMenu = false;
  unsubChatList;
  dateCount = 0;
  showEmoijs = false;





  normalEmojis: string[] = [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
    '😋', '😎', '😍', '😗', '😙', '🙂', '🤗', '🤔', '😐', '😑', 
    '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫',
    '😴', '😌', '😜', '🤤', '😛', '🤑', '😲', '🙃', '😷', '🤒', 
    '🤕', '🤧', '😵', '🤯', '😤', '😭', '😢', '😨'
  ];

  workEmojis: string[] = [
    '💼', '📁', '📅', '🖥️', '📊', '📈', '📉', '📝', '💻', '🖱️',
    '📋', '📌', '🖇️', '📄', '✏️', '📤', '📥', '📧', '📞', '📡', 
    '🔒', '🔓', '🗑️', '🧾', '📆', '🏢', '🏛️'
  ];

  
  activeBoard: string = 'normal';
  selectedEmoji: string | null = null;

  @Output() emojiSelected = new EventEmitter<string>();

  
  selectEmoji(emoji: string, inputField: HTMLTextAreaElement): void {
    this.selectedEmoji = emoji;
    
    const start = inputField.selectionStart ?? 0;
    const end = inputField.selectionEnd ?? 0;

    this.firebaseMessenger.content = this.firebaseMessenger.content.slice(0, start) + emoji + this.firebaseMessenger.content.slice(end);
    
    
    setTimeout(() => {
      inputField.selectionStart = inputField.selectionEnd = start + emoji.length;
      inputField.focus();
    }, 0);
  }

  switchBoard(board: string): void {
    this.activeBoard = board;
  }


  openEmoijs() {
    if (this.showEmoijs == false) {
      this.showEmoijs = true;
    } else {
      this.showEmoijs = false;
    }
  }












  constructor(public firebaseMessenger: FirebaseMessengerService, public threadService: ThreadService, public messengerService: MessengerService, public datePipe: DatePipe) {
    this.unsubChatList = firebaseMessenger.subChatsList();   
  }


  checkDate(messageDate: Date) {
    const formatter = new Intl.DateTimeFormat('de-DE', { dateStyle: 'short' });
    let dateToday = new Date();
    const dateTodayString = formatter.format(dateToday);
    const dateMessageString = formatter.format(messageDate);
    
    if (dateTodayString == dateMessageString) {
      return 'Heute';
    } else {
      return this.datePipe.transform(messageDate, 'EEEE, MMMM d');
    }
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
