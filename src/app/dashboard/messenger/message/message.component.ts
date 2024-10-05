import { Component, Input } from '@angular/core';
import { MessengerService } from '../../../shared/firebase-services/messenger.service';
import { Message } from '../../../shared/interfaces/message';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EditMessageComponent } from './edit-message/edit-message.component';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    EditMessageComponent,
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
  hoveredMessageId: number;
  editMessage: boolean;
  hoveredMenu = false;

  constructor(public firebase: MessengerService) {      
  }

  showOrHideMenu() {
    if (this.hoveredMenu == false) {
        this.hoveredMenu = true;
    } else {
      this.hoveredMenu = false;
    }
  }

  closeEdit(closeEditMessage: boolean) {
    this.editMessage = closeEditMessage;
  }
}
