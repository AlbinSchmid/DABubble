import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FirebaseMessengerService } from '../../../services/firebase-services/firebase-messenger.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThreadService } from '../../../services/thread-service/thread.service';
import { EmojiBoardComponent } from '../../emoji-board/emoji-board.component';
import { CommonModule } from '@angular/common';
import { MessengerService } from '../../../services/messenger-service/messenger.service';
import { MessageInterface } from '../../../interfaces/message-interface';
import { MessageParserService } from '../../../services/message-parser.service';

@Component({
  selector: 'app-edit-message',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    EmojiBoardComponent,
    CommonModule,
  ],
  templateUrl: './edit-message.component.html',
  styleUrl: './edit-message.component.scss'
})
export class EditMessageComponent implements OnInit{
  @Input() message: MessageInterface = {
    content: '',
    isRead: false,
    senderId: '',
    senderName: '',
    senderAvatar: '',
    date: 0,
    type: '',
    id: '',
    reactions: {
      content: '',
      senderIDs: '',
      senderNames: '',
      messageID: '',
    }
  };
  @Input() editAnswerMessage: boolean;
  @Input() sourceThread: boolean;
  @Output() closeEditMessage = new EventEmitter<boolean>();
  showEdit = false;
  showEmojiBoard = false;
  messageParser = inject(MessageParserService);
  messageText='';
  messageItems:string[]=[];


  constructor(private firebase: FirebaseMessengerService, private threadService: ThreadService, public messengerService: MessengerService) {
    setTimeout(() => {
      
      
    });
  }

  ngOnInit() {
    this.extractImagesAndText(this.message.content);
    console.log('Extracted Images:', this.messageItems);
    console.log('Remaining Text:', this.messageText);
  }


  extractImagesAndText(messageContent: string): void {
    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
    let match;
    this.messageItems = [];
    this.messageText = messageContent;
    while ((match = imgRegex.exec(messageContent)) !== null) {
        const url = match[1];  
        this.messageItems.push(url);  
    }
    this.messageText = this.messageText.replace(imgRegex, '').trim();
    this.messageText = this.messageText.replace(/<[^>]*>/g, '').trim(); 
    console.log('Extracted Images:', this.messageItems);
    console.log('Remaining Text:', this.messageText);
}

  closeOrOpenEmojisBoard() {
    if (!this.showEmojiBoard) {
      this.showEmojiBoard = true;
    } else {
      this.showEmojiBoard = false;
    }
  }


  closeEdit() {
    this.closeEditMessage.emit(this.showEdit);
  }


  checkWithMessageShouldUptade() {
    const imageTags = this.messageItems.map(url => `<img src="${url}" alt="Image" style="max-width: 200px;"/>`).join('');
    this.message.content = `${this.messageText} ${imageTags}`.trim(); 

    if (this.editAnswerMessage) {
        this.firebase.updateAnswer(this.message, this.message.id);
    } else {
        this.firebase.updateMessage(this.message, this.message.id);
    }
    this.closeEdit();
  }

  deleteImage(url: string) {
    const index = this.messageItems.indexOf(url);
    if (index > -1) {
      this.messageItems.splice(index, 1); 
    }
    const imageTags = this.messageItems.map(imgUrl => `<img src="${imgUrl}" alt="Image" style="max-width: 200px;"/>`).join('');
    this.message.content = `${this.messageText} ${imageTags}`.trim(); 
    console.log('Updated Message Content:', this.message.content);
  }
}
