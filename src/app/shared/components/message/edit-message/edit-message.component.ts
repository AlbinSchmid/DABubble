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
  messageText= '';
  messageItems:string[] = [];


  constructor(private firebase: FirebaseMessengerService, private threadService: ThreadService, public messengerService: MessengerService) {
    setTimeout(() => {
      
      
    });
  }


  getMessageText() {
    const parsedMessage = this.messageParser.parseMessage(this.message.content);
    this.extractLinksAndText(parsedMessage);
    console.log('Text Message:', this.messageText);
    console.log('Message Items (Full HTML Tags):', this.messageItems);
  }

  extractLinksAndText(text: string) {
    const anchorTagRegex = /<a\s+[^>]+>(.*?)<\/a>/g;
    let match;
    let lastIndex = 0;
    while ((match = anchorTagRegex.exec(text)) !== null) {
      console.log("Matched Anchor Tag: ", match[0]);
      this.messageText += text.substring(lastIndex, match.index);
  
      const currentTag = match[0];
      const imageTagRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g;
      const imageTagMatch = imageTagRegex.exec(currentTag);
  
      if (imageTagMatch) {
        const imageUrl = imageTagMatch[1];
        console.log("Found Image URL: ", imageUrl);
        const fileExtension = (imageUrl.split('.').pop() || '').toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          console.log("Pushing Non-Image Anchor Tag to messageItems: ", currentTag);
          this.messageItems.push(currentTag);  
        }
      } else {
        console.log("Pushing Normal Anchor Tag to messageItems: ", currentTag);
        this.messageItems.push(currentTag);  
      }
      lastIndex = anchorTagRegex.lastIndex;
    }
    this.messageText += text.substring(lastIndex).trim();
    console.log('Final messageText: ', this.messageText);
    console.log('Final messageItems: ', this.messageItems);
  }



  
 

  ngOnInit() {
    console.log('Remaining Text:', this.messageText);
    this.getMessageText();
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

    const imageTags = this.messageItems.map(item => item).join(' '); 
    this.message.content = `${this.messageText} ${imageTags}`.trim(); 

    console.log('Final message content before update:', this.message.content);
    if (this.editAnswerMessage) {
        this.firebase.updateAnswer(this.message, this.message.id)
            .then(() => console.log('Message answer updated successfully'))
            .catch(err => console.error('Error updating message answer:', err));
    } else {
        this.firebase.updateMessage(this.message, this.message.id)
            .then(() => console.log('Message updated successfully'))
            .catch(err => console.error('Error updating message:', err));
    }
    this.closeEdit();
}

deleteImage(item: string) {

  const index = this.messageItems.indexOf(item);
  if (index > -1) {
    this.messageItems.splice(index, 1);
  }
  console.log('Updated messageItems:', this.messageItems);
}
}
