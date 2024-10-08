import { Component, Input } from '@angular/core';
import { MessengerService } from '../../services/messenger.service';
import { ThreadService } from '../../services/thread.service';
import { EditMessageComponent } from './edit-message/edit-message.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Message } from '../../interfaces/message';

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
  @Input() messageId: number;
  @Input() reduceContent: boolean;
  hoveredMessageId: number;
  editMessageId: number;
  editMessage: boolean;
  hoveredMenu = false;




  constructor(public firebase: MessengerService, public threadService: ThreadService) {
  }


  showOrHideMenu() {
    if (this.hoveredMenu == false) {
      this.hoveredMenu = true;
    } else {
      this.hoveredMenu = false;
    }
  }


  openThead() {
    this.threadService.showThread = false;
    this.threadService.messageId = this.message.id;
    this.threadService.answeredMessage = this.message;
    setTimeout(() => {
      this.threadService.showThread = true;
    }, 10);
  }


  closeEdit(closeEditMessage: boolean) {
    this.editMessage = closeEditMessage;
  }
}
