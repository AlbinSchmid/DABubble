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
    senderID:'',
    senderName: '', 
    senderAvatar: '',
    date: 0,
    messageID: '',
  }
  test: MessageInterface[] = [
  ]
  showThreadSideNav: boolean = false;
  showThread = false;
  messageId: string;
  senderName: string = '';
  senderAvatar: string;
}
