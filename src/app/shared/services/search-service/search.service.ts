import { inject, Injectable, Injector } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { FilterMessage } from '../../interfaces/filter-message';
import { ThreadService } from '../thread-service/thread.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../firebase-services/firestore.service';
import { _getShadowRoot } from '@angular/cdk/platform';
import { Channel } from '../../interfaces/channel';
import { MessageInterface } from '../../interfaces/message-interface';
import { Message } from '../../../models/message.class';
import { RedirectService } from '../redirect-service/redirect.service';

export interface ChannelWithMessages {
  channel: Channel;
  messages: MessageInterface[];
  answers: MessageInterface[];
}
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  firestore = inject(Firestore);
  authService = inject(AuthserviceService);
  threadService = inject(ThreadService);
  firestoreService = inject(FirestoreService);
  messages: FilterMessage[] = [];
  threadMessages: FilterMessage[] = [];
  filteredThreads: FilterMessage[] = [];
  searchResults: FilterMessage[] = [];
  userListSubscription!: Subscription;
  userList: UserInterface[] = [];
  filteredUsers: UserInterface[] = [];
  unsubscribeMap = new Map<string, () => void>();
  channelListSubscription!: Subscription
  foundChannels: Channel[] = [];
  filteredChannels: Channel[] = [{
    createdBy: 'Entwickler',
    description: 'Der Allgemein-Channel ist zum Teilen von Meinungen und Feedback gedacht. Der Entwickler freut sich über jede Nachricht – also schreib rein, was dir auf dem Herzen liegt (außer vielleicht dein Pizzarezept)',
    isFocus: false,
    messages: [],
    title: 'Allgemein',
    userIDs: [],
  }];
  secondUser = {} as UserInterface;
  madeQuery = false;
  filteredChannelsThreads: ChannelWithMessages[] = [];
  foundMessagesInChannels: ChannelWithMessages[] = [];
  filteredMessagesInChannels: ChannelWithMessages[] = [];
  _redirectService?: RedirectService;
  injector = inject(Injector);

  get redirectService(): RedirectService {
    if (!this._redirectService) {
      this._redirectService = this.injector.get(RedirectService);
    }
    return this._redirectService;
  }

  constructor() {
    this.userListSubscription = this.firestoreService.userList$.subscribe(user => {
      this.userList = user;
    });
    this.channelListSubscription = this.firestoreService.channelList$.subscribe(channels => {
      this.foundChannels = channels;
    })
  }

  async fetchAllMessages() {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return;
    const chatRef = collection(this.firestore, 'chats');
    const chatSnapshot = await getDocs(chatRef);
    this.messages = [];
    const fetchPromises = chatSnapshot.docs.map(chatDoc => this.fetchMessagesFromChat(chatDoc, currentUser));
    await Promise.all(fetchPromises);
  }

  async getCurrentUser(): Promise<string | undefined> {
    let currentUser = this.authService.currentUserSig()?.userID;
    while (!currentUser) {
      await new Promise(resolve => setTimeout(resolve, 100));
      currentUser = this.authService.currentUserSig()?.userID;
    }
    return currentUser;
  }

  async fetchMessagesFromChat(chatDoc: any, currentUser: string): Promise<void> {
    const chatData = chatDoc.data();
    const { user1, user2 } = chatData;
    if (user1 === currentUser || user2 === currentUser) {
      const messagesRef = collection(chatDoc.ref, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      const fetchPromises = messagesSnapshot.docs.map(messageDoc =>
        this.extractMessageData(messageDoc)
      );
      await Promise.all(fetchPromises);
    }
  }

  async extractMessageData(messageDoc: any): Promise<void> {
    if (messageDoc.exists()) {
      const messageData = messageDoc.data();
      const messageInfo: FilterMessage = this.setMessageData(messageData, messageDoc);
      this.messages.push(messageInfo);
      const answersRef = collection(messageDoc.ref, 'answers');
      const answersSnapshot = await getDocs(answersRef);
      if (!answersSnapshot.empty) {
        answersSnapshot.forEach(answerDoc => {
          const answerData = answerDoc.data();
          const answerInfo: FilterMessage = this.setAnswerData(answerData, messageDoc, messageData);
          this.threadMessages.push(answerInfo);
        });
      }
    }
  }

  setMessageData(messageData: any, messageDoc: any) {
    return {
      content: messageData['content'],
      senderName: messageData['senderName'],
      date: messageData['date'],
      messageID: messageDoc.id,
      senderID: messageData['senderID']
    };
  }

  setAnswerData(answerData: any, messageDoc: any, messageData: any) {
    return {
      content: answerData['content'],
      senderName: answerData['senderName'],
      date: answerData['date'],
      messageID: messageDoc.id,
      senderID: messageData
    };
  }

  unsubscribeAll() {
    this.unsubscribeMap.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeMap.clear();
  }

  async search(query: string) {
    if (!query || !query.trim()) {
      this.madeQuery = false;
      this.redirectService.clearSearchResults();
      return;
    }
    this.redirectService.clearSearchResults();
    await this.filterChannels();
    await this.getMessagesForAllFoundChannels();
    await this.fetchAllMessages();
    await this.filterData(query);
    this.madeQuery = true;
  }

  async filterData(query: string) {
    this.searchResults = this.messages.filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase())
    );
    this.filteredThreads = this.threadMessages.filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase())
    );
    this.filteredUsers = this.userList.filter(user =>
      user.username.toLowerCase().includes(query.toLowerCase())
    );
    this.filteredChannels = this.foundChannels.filter(channel =>
      channel.title.toLowerCase().includes(query.toLowerCase())
    );
    this.filterInChannel(query);
  }

  filterInChannel(query: string) {
    this.filteredMessagesInChannels = this.foundMessagesInChannels
      .map(channelWithMessages => {
        const filteredMessages = channelWithMessages.messages.filter(message =>
          message.content?.toLowerCase().includes(query.toLowerCase())
        );
        const filteredAnswers = channelWithMessages.answers.filter(answer =>
          answer.content?.toLowerCase().includes(query.toLowerCase())
        );
        return {
          ...channelWithMessages,
          messages: filteredMessages,
          answers: filteredAnswers,
        };
      })
      .filter(
        channelWithMessages =>
          channelWithMessages.messages.length > 0 || channelWithMessages.answers.length > 0
      );
  }

  clearArrays() {
    this.searchResults = [];
    this.filteredUsers = [];
    this.filteredThreads = [];
    this.filteredChannels = [];
    this.threadMessages = [];
    this.filteredChannelsThreads = [];
    this.filteredMessagesInChannels = [];
    this.foundMessagesInChannels = [];
  }

  async filterChannels() {
    const userId = this.authService.currentUserSig()?.userID;
    this.foundChannels.forEach((channel) => {
      if (channel.userIDs.includes(userId!)) {
        this.filteredChannels.push(channel);
      }
    })
  }

  async getMessagesForAllFoundChannels() {
    if (!this.foundChannels || this.foundChannels.length === 0) {
      return;
    }
    const channelsWithMessages = await Promise.all(
      this.foundChannels.map(channel => this.getChannelWithMessages(channel))
    );
    this.foundMessagesInChannels = channelsWithMessages.filter(
      result => result !== null
    ) as ChannelWithMessages[];
  }

  async getChannelWithMessages(channel: Channel) {
    const channelDoc = await this.getChannelDocument(channel.title);
    if (!channelDoc) {
      return null;
    }
    const channelId = channelDoc.id;
    const channelData = { channelID: channelId, ...channelDoc.data() } as Channel;
    const messages = await this.getMessagesWithAnswers(channelId);
    return {
      channel: channelData,
      messages: messages.messagesWithAnswers,
      answers: messages.topLevelAnswers
    };
  }

  async getChannelDocument(title: string) {
    const channelsCollection = collection(this.firestore, 'channels');
    const channelQuery = query(channelsCollection, where('title', '==', title));
    const channelSnapshot = await getDocs(channelQuery);
    if (channelSnapshot.empty) {
      return null;
    }
    return channelSnapshot.docs[0];
  }

  async getMessagesWithAnswers(channelId: string) {
    const messagesCollection = collection(this.firestore, `channels/${channelId}/messages`);
    const messagesSnapshot = await getDocs(messagesCollection);
    const topLevelAnswers: MessageInterface[] = [];
    const messagesWithAnswers = await Promise.all(
      messagesSnapshot.docs.map(async messageDoc => {
        const messageData = this.getMessageData(messageDoc);
        const answers = await this.getAnswers(channelId, messageDoc.id);
        topLevelAnswers.push(...answers);
        return { ...messageData, answers };
      })
    );
    return { messagesWithAnswers, topLevelAnswers };
  }

  getMessageData(messageDoc: any): MessageInterface {
    return {
      content: messageDoc.data()['content'],
      isRead: messageDoc.data()['isRead'],
      senderID: messageDoc.data()['senderID'],
      senderName: messageDoc.data()['senderName'],
      senderAvatar: messageDoc.data()['senderAvatar'],
      date: messageDoc.data()['date'],
      messageID: messageDoc.id
    } as MessageInterface;
  }

  async getAnswers(channelId: string, messageId: string): Promise<MessageInterface[]> {
    const answersCollection = collection(
      this.firestore,
      `channels/${channelId}/messages/${messageId}/answers`
    );
    const answersSnapshot = await getDocs(answersCollection);
    return answersSnapshot.docs.map(answerDoc => ({
      content: answerDoc.data()['content'],
      senderID: answerDoc.data()['senderID'],
      senderName: answerDoc.data()['senderName'],
      senderAvatar: answerDoc.data()['senderAvatar'],
      date: answerDoc.data()['date'],
      messageID: messageId
    })) as MessageInterface[];
  }

  clearSearchResults() {
    setTimeout(() => {
      this.clearArrays();
      this.unsubscribeAll();
      this.threadService.showThreadSideNav = false;
      this.threadService.showThread = false;
      this.threadService.messageToReplyTo = new Message
        ();
      this.madeQuery = false;
    }, 50);
  }
}