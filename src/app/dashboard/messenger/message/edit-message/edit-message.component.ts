import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Message } from '../../../../shared/interfaces/message';
import { MessengerService } from '../../../../shared/services/firebase-services/messenger.service';

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
  

  constructor(private firebase: MessengerService) {
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
