import { Injectable } from '@angular/core';
import { MessageInterface } from '../../interfaces/message-interface';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  answeredMessage: MessageInterface = {
    content: '',
    isRead: false,
    senderId:'',
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
  }
  test: MessageInterface[] = [
  ]
  showThread = false;
  messageId: string;
  senderName: string = '';
  senderAvatar: string;
}
