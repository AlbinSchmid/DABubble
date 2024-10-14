import { Injectable } from '@angular/core';
import { Message } from '../../interfaces/message';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  answeredMessage: Message = {
    content: '',
    isRead: false,
    senderId:'',
    senderName: '', 
    senderAvatar: '',
    date: 0,
    type: '',
    id: '',
  }
  test: Message[] = [
  ]
  showThread = false;
  messageId: string;
  senderName: string = '';
  senderAvatar: string;
}
