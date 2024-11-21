import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Channel } from '../../interfaces/channel';
import { Message } from '../../../models/message.class';
import { ThreadService } from '../thread-service/thread.service';
import { FirebaseMessengerService } from '../firebase-services/firebase-messenger.service';
import { User } from '@angular/fire/auth';
import { FirestoreService } from '../firebase-services/firestore.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {
  threadService = inject(ThreadService);
  firestoreService: FirestoreService = inject(FirestoreService);

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
  openNewMessage: boolean = false;
  messageDates: string[] = [];
  scrollContainer: any;
  openMessenger = false;

  selectUserNewMessage: UserInterface[] = [];
  selectChannelsNewMessage: Channel[] = [];

  textareaMessenger = new Subject<void>();
  textareaThread = new Subject<void>();





  scrollToBottom(container: any) {
    container.nativeElement.scrollTop = container.nativeElement.scrollHeight;
  }


  showChannel(channel: Channel) {
    this.closeEverthing();
    this.channel = channel;
    this.openChannel = true;
    this.openChart = false;
    this.openNewMessage = false;
    setTimeout(() => {
      this.textareaMessenger.next();
    },);
  }


  getEmptyChannel(): Channel {
    return {
      channelID: '',
      title: '',
      description: '',
      createdBy: '',
      isFocus: false,
      userIDs: [],
      messages: [],
    }
  }


  getEmptyUser(): UserInterface {
    return {
      userID: '',
      password: '',
      email: '',
      username: '',
      avatar: '',
      userStatus: '',
      isFocus: false,
    }
  }


  showChart(user: UserInterface) {
    this.closeEverthing();
    this.openChannel = false;
    this.openChart = true;
    this.openNewMessage = false;
    this.user = user;
    setTimeout(() => {
      this.textareaMessenger.next();
    },);
  }


  showNewMessage() {
    this.openMessenger = false;
    this.closeEverthing();
    this.openChannel = false;
    this.openChart = false;
    this.openNewMessage = true;
    this.channel.isFocus = false;
    this.user.isFocus = false;
    this.channel = this.getEmptyChannel();
    this.user = this.getEmptyUser();
  }


  closeEverthing() {
    this.showMessenger = false;
    this.threadService.showThreadSideNav = false;
    this.threadService.showThread = false;
    this.chartId = '';
  }
}
