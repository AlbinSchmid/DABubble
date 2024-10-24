import { Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { MessageInterface } from '../../interfaces/message-interface';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {
  message: MessageInterface = {
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
  editMessageContent: string;
  showMessenger = false;
  userId: string;
  chartId = '';
  messageId = '';
  showReactions = false;
  user: UserInterface = {
    userID: '',
    password: '',
    email: '',
    username: '',
    avatar: '',
    userStatus: '',
    isFocus: false,
  }
  channel = {
    channelID: '',
    title: '',
  };

  openChannel = false;
  openChart = false;
  constructor() {
  }
}
