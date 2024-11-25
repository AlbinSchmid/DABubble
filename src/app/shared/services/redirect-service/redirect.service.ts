import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { MessengerService } from '../messenger-service/messenger.service';
import { FirebaseMessengerService } from '../firebase-services/firebase-messenger.service';
import { ThreadService } from '../thread-service/thread.service';
import { FirestoreService } from '../firebase-services/firestore.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { SearchService } from '../search-service/search.service';
import { Message } from '../../../models/message.class';
import { Channel } from '../../interfaces/channel';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  firestore = inject(Firestore);
  authService = inject(AuthserviceService);
  messengerService = inject(MessengerService);
  firebaseMessenger = inject(FirebaseMessengerService);
  threadService = inject(ThreadService);
  firestoreService = inject(FirestoreService);
  searchService = inject(SearchService);
  secondUser = this.searchService.secondUser;

  constructor() { 

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

  async openThead(message: any, messagetoreplyto: any) {
    await this.goToMessage(message.messageID);
    this.scrollToMessage(messagetoreplyto.messageID);
    this.openedThreadConfig(message, messagetoreplyto);
  }

  clearSearchResults() {
    setTimeout(() => {
      this.searchService.clearArrays();
      this.searchService.unsubscribeAll();
      this.threadService.showThreadSideNav = false;
      this.threadService.showThread = false;
      this.threadService.messageToReplyTo = new Message
      ();
      this.searchService.madeQuery = false;
    }, 50);
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
    this.focusChannel(channel);
  }

  focusChannel(channel: Channel) {
    this.threadService.channelID = channel.channelID;
    this.firestoreService.setAndGetCurrentlyFocusedChat(channel);
    this.firebaseMessenger.content = '';
    this.firebaseMessenger.answerContent = '';
    this.messengerService.showChannel(channel);
    channel.isFocus = true;
    this.threadService.getTheUsersOfChannel();
    this.messengerService.messageDates = [];
    this.firebaseMessenger.messages = [];
    this.firebaseMessenger.subSomethingList('noID', 'noCollection');
    this.messengerService.openMessenger = true;
  }

  goToUser(user: UserInterface) {
    this.configureMessenger(user)
    this.clearSearchResults()
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
}
