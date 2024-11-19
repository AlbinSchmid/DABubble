import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, onSnapshot, query, where } from '@angular/fire/firestore';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { FilterMessage } from '../../interfaces/filter-message';
import { MessengerService } from '../messenger-service/messenger.service';
import { FirebaseMessengerService } from '../firebase-services/firebase-messenger.service';
import { ThreadService } from '../thread-service/thread.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../firebase-services/firestore.service';
import { _getShadowRoot } from '@angular/cdk/platform';
import { Channel } from '../../interfaces/channel';
import { MessageInterface } from '../../interfaces/message-interface';
import { Message } from '../../../models/message.class';

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
  messengerService = inject(MessengerService);
  firebaseMessenger = inject(FirebaseMessengerService);
  threadService = inject(ThreadService);
  firestoreService = inject(FirestoreService);
  messages: FilterMessage[] = [];
  threadMessages: FilterMessage[] = [];
  filteredThreads: FilterMessage[] = [];
  searchResults: FilterMessage[] = [];
  secondUser = {} as UserInterface;
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
  madeQuery = false;
  filteredChannelsThreads: ChannelWithMessages[] = [];
  foundMessagesInChannels: ChannelWithMessages[] = [];
  filteredMessagesInChannels: ChannelWithMessages[] = [];

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
      this.clearSearchResults();
      return;
    }
    this.clearSearchResults();
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

  async getChatIdBasedOnMessageID(messageID: string) {
    const chatsRef = collection(this.firestore, 'chats');
    const chatSnapshot = await getDocs(chatsRef);
    for (const chatDoc of chatSnapshot.docs) {
      const messagesRef = collection(chatDoc.ref, 'messages');
      const messageSnapshot = await getDocs(messagesRef);
      if (messageSnapshot.docs.some(messageDoc => messageDoc.id === messageID)) {
        return chatDoc.id;
      }
    }
    return null;
  }

  async getTheUser1AndUser2BasedOnChatID(messageID: string) {
    const chatID = await this.getChatIdBasedOnMessageID(messageID);
    if (!chatID) return null;
    const chatRef = doc(this.firestore, `chats/${chatID}`);
    const chatSnapshot = await getDoc(chatRef);
    if (chatSnapshot.exists()) {
      const chatData = chatSnapshot.data();
      return { user1: chatData['user1'], user2: chatData['user2'] };
    }
    return null;
  }

  async getUserFullData(messageID: string) {
    const users = await this.getTheUser1AndUser2BasedOnChatID(messageID);
    const currentUserId = this.authService.currentUserSig()?.userID;
    const otherUserId = users?.user1 === currentUserId ? users?.user2 : users?.user1;
    if (otherUserId) {
      const otherUserRef = doc(this.firestore, `users/${otherUserId}`);
      const otherUserSnapshot = await getDoc(otherUserRef);
      if (otherUserSnapshot.exists()) {
        this.secondUser = otherUserSnapshot.data() as UserInterface;
      }
    }
  }

  async goToMessage(messageID: string) {
    this.clearSearchResults();
    await this.getUserFullData(messageID);
    const user = this.secondUser;
    if (user) {
      this.configureMessenger(user);
      setTimeout(() => this.scrollToMessage(messageID), 100);
    }
  }

  configureMessenger(user: UserInterface) {
    this.closeUiElements();
    this.messengerService.openChannel = false;
    this.messengerService.openChart = true;
    this.messengerService.user = user;
    this.firebaseMessenger.searchChat(user);
  }

  closeUiElements(){
    this.threadService.showThreadSideNav = false;
    this.messengerService.showMessenger = false;
    this.messengerService.chartId = '';
    this.threadService.showThread = false;
  }

  goToChannel(channel: Channel) {
    this.clearSearchResults();
    this.closeUiElements();
    this.messengerService.channel = channel;
    this.messengerService.openChannel = true;
    this.messengerService.openChart = false;
    setTimeout(() => {
      this.messengerService.showMessenger = true;
    }, 50);
  }

  scrollToMessage(messageID: string) {
    setTimeout(() => {
      const messagesContainer = document.querySelector('#messages-container');
      if (messagesContainer) {
        const messageElement = document.getElementById(`${messageID}`);
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 300);
  }

  goToUser(user: UserInterface) {
    this.configureMessenger(user)
    this.clearSearchResults()
  }

  async openThead(message: any, messagetoreplyto: any) {
    await this.goToMessage(message.messageID);
    this.scrollToMessage(messagetoreplyto.messageID);
    this.openedThreadConfig(message, messagetoreplyto);
  }

  async openThreadInChannel(message: any, messageId: any, channel: Channel) {
    this.goToChannel(channel);
    const messageToReplyTo = await this.getMessageInChannelById(messageId, channel);
    if (!messageToReplyTo) {
      console.error("Message to reply to not found!");
      return;
    }
    this.scrollToMessage(messageId);
    this.openedThreadConfig(message, messageToReplyTo);
  }

  openedThreadConfig(message: any, messageToReplyTo: any) {
    setTimeout(() => {
      this.threadService.messageToReplyTo = message;
      this.threadService.showThread = true;
      this.threadService.showThreadSideNav = true;
      this.firebaseMessenger.subSomethingList(this.threadService.messageToReplyTo.messageID, 'answer');
      this.threadService.messageToReplyTo = messageToReplyTo;
    }, 300);
    setTimeout(() => {
      this.scrollToThreadMessage(message.content)
    }, 600);
  }


  scrollToThreadMessage(messageContent: any) {
    const messagesContainer = document.getElementsByClassName('threadContent');
    if (messagesContainer) {
      const messageElement = document.getElementById(`${messageContent}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  clearSearchResults() {
    setTimeout(() => {
      this.clearArrays();
      this.unsubscribeAll();
      this.threadService.showThreadSideNav = false;
      this.threadService.showThread = false;
      this.threadService.messageToReplyTo = new Message();
      this.madeQuery = false;
    }, 50);
  }

  clearArrays(){
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

  goToMessageInChannel(messageID: string, channel: Channel) {
    this.clearSearchResults();
    this.goToChannel(channel);
    setTimeout(() => {
      this.scrollToMessage(messageID);
    }, 100);
  }

  async getMessageInChannelById(messageId: string, channel: Channel) {
    const messageRef = doc(this.firestore, `channels/${channel.channelID}/messages/${messageId}`);
    const snapshot = await getDoc(messageRef);
    if (snapshot.exists()) {
      return snapshot.data() as Message;
    } else {
      return null;
    }
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
}