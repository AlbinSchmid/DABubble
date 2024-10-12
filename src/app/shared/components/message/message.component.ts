import { Component, inject, Input } from '@angular/core';
import { ThreadService } from '../../services/thread-service/thread.service';
import { EditMessageComponent } from './edit-message/edit-message.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Message } from '../../interfaces/message';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    EditMessageComponent,
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() message: Message = {
    content: '',
    isRead: false,
    senderId: 0,
    date: 0,
    type: '',
    id: '',
  };
  @Input() messageIndex: number;
  @Input() reduceContent: boolean;
  authService = inject(AuthserviceService);
  hoveredMessageId: number;
  editMessageId: number;
  editMessage: boolean;
  hoveredMenu = false;


  constructor(public firebase: FirebaseMessengerService, public threadService: ThreadService) { }


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
    setTimeout(() => {
      this.threadService.showThread = true;
    }, 10);
  }


  /**
   * Close the edit window
   * @param closeEditMessage - the boolean we got from our child component (edit-message) 
   */
  closeEdit(closeEditMessage: boolean) {
    this.editMessage = closeEditMessage;
  }
}
