import { Injectable } from '@angular/core';
import { MessageInterface } from '../../interfaces/message-interface';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Message } from '../../../models/message.class';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  messageToReplyTo = new Message;
  showThreadSideNav: boolean = false;
  showThread = false;
  messageId: string;
  senderName: string = '';
  senderAvatar: string;
  scrollContainer: any;
}
