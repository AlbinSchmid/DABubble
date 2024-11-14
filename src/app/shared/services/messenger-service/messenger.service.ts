import { Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Channel } from '../../interfaces/channel';
import { Message } from '../../../models/message.class';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {
  message = new Message;
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
  showNewMessage: boolean = false;
  messageDates: string[] = [];
  scrollContainer: any;

  scrollToBottom(container: any) {
    container.nativeElement.scrollTop = container.nativeElement.scrollHeight;
  }
}
