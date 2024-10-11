import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FirebaseMessengerService } from '../../../services/firebase-services/firebase-messenger.service';
import { Message } from '../../../interfaces/message';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    senderId: 0,
    date: 0,
    type: '',
    id: '',
  };
  @Output() closeEditMessage = new EventEmitter<boolean>();
  showEdit = false;
  editMessageContent: string;
  

  constructor(private firebase: FirebaseMessengerService) {
    setTimeout(() => {
      this.editMessageContent = this.message.content;
    });
  }


  closeEdit() {
   this.closeEditMessage.emit(this.showEdit);
  }


  updateMessage() {
    this.message.content = this.editMessageContent;
    this.firebase.updateMessage(this.message, this.message.id)    
    this.closeEdit();
  }
}
