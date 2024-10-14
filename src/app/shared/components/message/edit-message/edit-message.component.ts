import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FirebaseMessengerService } from '../../../services/firebase-services/firebase-messenger.service';
import { Message } from '../../../interfaces/message';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThreadService } from '../../../services/thread-service/thread.service';

@Component({
  selector: 'app-edit-message',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './edit-message.component.html',
  styleUrl: './edit-message.component.scss'
})
export class EditMessageComponent {
  @Input() message: Message = {
    content: '',
    isRead: false,
    senderId: '',
    senderName: '',
    senderAvatar: '',
    date: 0,
    type: '',
    id: '',
  };
  @Input() editAnswerMessage: boolean;
  @Output() closeEditMessage = new EventEmitter<boolean>();
  showEdit = false;
  editMessageContent: string;


  constructor(private firebase: FirebaseMessengerService, private threadService: ThreadService) {
    setTimeout(() => {
      this.editMessageContent = this.message.content;
    });
  }


  closeEdit() {
    this.closeEditMessage.emit(this.showEdit);
  }


  checkWithMessageShouldUptade() {
    this.message.content = this.editMessageContent;
    if (this.editAnswerMessage == true) {
      this.firebase.updateAnswer(this.message, this.message.id)
    } else {
      this.firebase.updateMessage(this.message, this.message.id)
    }
    this.closeEdit();
  }
}
