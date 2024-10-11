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
    senderId: 0,
    date: 0,
    type: '',
    id: '',
  }
  test: Message[] = [
  ]
  showThread = false;
  messageId: string;
}
