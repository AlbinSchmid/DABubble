import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Channel } from '../../interfaces/channel';
import { Message } from '../../../models/message.class';
import { ThreadService } from '../thread-service/thread.service';
import { FirebaseMessengerService } from '../firebase-services/firebase-messenger.service';
import { User } from '@angular/fire/auth';
import { FirestoreService } from '../firebase-services/firestore.service';
import { Subject } from 'rxjs';
import { MentionUserInterface } from '../../interfaces/mention-user-interface';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {
  threadService = inject(ThreadService);
  firestoreService = inject(FirestoreService);

  message = new Message;
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
  messageDates: string[] = [];
  selectUserNewMessage: UserInterface[] = [];
  selectChannelsNewMessage: Channel[] = [];

  scrollContainer: any;

  textareaMessenger = new Subject<void>();
  textareaThread = new Subject<void>();
  editMessageContent: string;
  userId: string;
  messageName: string;
  showMessageBtn: boolean;

  showDate1Count = false;
  openChannel = false;
  openChart = false;
  openNewMessage = false;
  openMessenger = false;
  showAddPerson = false;
  showMessenger = false;
  showReactions = false;
  chartId = '';
  messageId = '';


  /**
   * Given a string, splits it into words and returns the first word.
   * @param name the string to split
   * @returns the first word of the string
   */
  getFirstWord(name: string): string {
    const words = name.split(" ");
    return words[0];
  }


  /**
   * Extracts the first letter of the second word in a given string.
   * If the string does not contain at least two words, returns an empty string.
   * 
   * @param name - The string to extract the letter from
   * @returns The first letter of the second word, or an empty string if unavailable
   */
  getSecondWordFirstLetter(name: string): string {
    const words = name.split(" ");
    return words[1]?.charAt(0) || "";
  }


  /**
   * Sorts an array of objects alphabetically by the value of the 'userName'
   * property. If the 'userName' property does not exist on an object, an
   * empty string is used as a fallback.
   *
   * @param array - The array to sort
   */
  sortByName(array: any[]): void {
    array.sort((a, b) => {
      const nameA = a?.userName || '';
      const nameB = b?.userName || '';
      return nameA.localeCompare(nameB);
    });
  }


  /**
   * Scrolls a given container to the bottom of its content.
   * If the container does not exist, nothing is done.
   * @param container - The container to scroll
   */
  scrollToBottom(container: any): void {
    if (container) {
      container.nativeElement.scrollTop = container.nativeElement.scrollHeight;
    }
  }


  /**
   * Shows the given channel in the messenger component and sets the channel as the currently focused
   * channel. It also closes all other parts of the messenger and resets the content of the messenger.
   * Finally, it triggers a change detection cycle of the textarea of the messenger component after a
   * short delay.
   * @param channel the channel to show
   */
  showChannel(channel: Channel): void {
    this.closeEverthing();
    this.channel = channel;
    this.openChannel = true;
    this.openChart = false;
    this.openNewMessage = false;
    setTimeout(() => {
      this.textareaMessenger.next();
    }, 100);
  }


  /**
   * Returns an empty Channel object.
   * This object is used as a template for the messenger component when no channel is selected.
   * @returns An empty Channel object
   */
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


  /**
   * Returns an empty UserInterface object.
   * This object serves as a template for user data with default empty values.
   * 
   * @returns An empty UserInterface object
   */
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


  /**
   * Shows the messenger component with a direct message conversation with the given user.
   * It first closes other UI elements, then sets the messenger service to open a chart
   * and assigns the given user to the messenger service. Finally, it calls the searchChat
   * function to retrieve the chat ID associated with a conversation with the given user.
   * @param user - The user object to open the conversation with.
   */
  showChart(user: UserInterface): void {
    this.closeEverthing();
    this.openChannel = false;
    this.openChart = true;
    this.openNewMessage = false;
    this.user = user;
    setTimeout(() => {
      this.textareaMessenger.next();
    }, 300);
    this.messageName = user.username;
  }


  /**
   * Shows the messenger component with a new message input field.
   * It first closes all UI elements, then sets the messenger service to open a new message
   * and resets the channel and user objects to empty templates.
   */
  showNewMessage(): void {
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

  
  /**
   * Closes all messenger UI elements. It sets the openMessenger flag to false,
   * closes the thread side nav and thread, and resets the chartId to an empty string.
   */
  closeEverthing(): void {
    this.openMessenger = false;
    this.threadService.showThreadSideNav = false;
    this.threadService.showThread = false;
    this.chartId = '';
  }
}
