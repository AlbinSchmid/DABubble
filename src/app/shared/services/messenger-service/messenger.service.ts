import { Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { MessageInterface } from '../../interfaces/message-interface';
import { Channel } from '../../interfaces/channel';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {
  message: MessageInterface = {
    content: '',
    isRead: false,
    senderID: '',
    senderName: '',
    senderAvatar: '',
    date: 0,
    messageID: '',
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
  channel: Channel = {
    channelID: '',
    title: '',
    description: '',
    createdBy: '',
    isFocus: false,
    userIDs: [],
    messages: [],
  };
  openChannel = false;
  openChart = false;
  messageDates: string[] = [];
}
