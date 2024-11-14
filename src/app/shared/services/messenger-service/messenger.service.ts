import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Channel } from '../../interfaces/channel';
import { Message } from '../../../models/message.class';
import { ThreadService } from '../thread-service/thread.service';
import { FirebaseMessengerService } from '../firebase-services/firebase-messenger.service';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {
  threadService = inject(ThreadService);
  // firebaseMessenger = inject(FirebaseMessengerService);

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
  messageDates: string[] = [];
  scrollContainer: any;


  scrollToBottom(container: any) {
    container.nativeElement.scrollTop = container.nativeElement.scrollHeight;
  }


  showChannel(channel: Channel) {
    this.closeEverthing();
    this.channel = channel;
    this.openChannel = true;
    this.openChart = false;
    setTimeout(() => {
      this.showMessenger = true;
    },10);
  }


  showChart(user: UserInterface) {
    this.closeEverthing();
    this.openChannel = false;
    this.openChart = true;
    this.user = user;
  }


  closeEverthing() {
    this.showMessenger = false;
    this.threadService.showThreadSideNav = false;
    this.threadService.showThread = false;
    this.chartId = '';
  }

}
