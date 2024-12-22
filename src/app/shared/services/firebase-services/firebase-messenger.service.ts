import { inject, Injectable } from '@angular/core';
import { addDoc, collection, Firestore, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { deleteDoc, doc, DocumentData, Primitive, query, where, } from 'firebase/firestore';
import { MessageInterface } from '../../interfaces/message-interface';
import { ThreadService } from '../thread-service/thread.service';
import { MessengerService } from '../messenger-service/messenger.service';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { ReactionInterface } from '../../interfaces/reaction-interface';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { User } from '@angular/fire/auth';
import { FirestoreService } from './firestore.service';
import { MentionUserInterface } from '../../interfaces/mention-user-interface';
import { UntypedFormBuilder } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessengerService {
  firestore: Firestore = inject(Firestore);
  authService = inject(AuthserviceService);
  threadService = inject(ThreadService);
  messengerService = inject(MessengerService);

  content = '';
  answerContent = '';
  reaktionContent = '';

  messages: MessageInterface[] = [];
  answers: MessageInterface[] = [];
  reactions: ReactionInterface[] = [];

  tryOtherOption: boolean;
  messageOrThread: string;

  forCount = 0;


  /**
   * Deletes a reaction from the database.
   * @param messageID - The ID of the message that the reaction belongs to.
   * @param reaktionID - The ID of the reaction to be deleted.
   * @returns A promise that resolves when the reaction is deleted.
   */
  async deleteReaction(messageID: string, reaktionID: string): Promise<void> {
    const path = `${this.checkCollectionChatOrChannel()}/${this.checkDocChatIDOrChannelID()}/messages/${messageID}/reactions/${reaktionID}`;
    try {
      await deleteDoc(doc(this.firestore, path));
    } catch (error) {
      console.error('Error deleting reaction:', error);
    }
  }


  /**
   * 
   * @param messageId - messageId where we get the answeres
   * @returns get the path of the answere chat
   */
  subSomethingList(messageID: string, collectionOfMessage: string, callback?: any): any {
    const messegeRef = collection(this.firestore, `${this.checkCollectionChatOrChannel()}/${this.checkDocChatIDOrChannelID()}/messages${this.checkCollectionOfMessage(messageID, collectionOfMessage)}`);
    return onSnapshot(messegeRef, (list) => {
      if (collectionOfMessage == 'answer') {
        this.safeAnswersData(list);
      } else if (collectionOfMessage == 'noCollection') {
        this.safeChatData(list);
      }
      if (callback) {
        return callback();
      }
    })
  }


  /**
   * Processes a list of answer documents and updates the local answers array.
   * 
   * This function clears the current answers array and populates it with 
   * new answer objects created from the provided list. Each element in the 
   * list is transformed into an answer object using the setMessageObject 
   * method. After populating the array, the answers are sorted by date.
   * 
   * @param list - A collection of answer documents to be processed.
   */
  safeAnswersData(list: any): void {
    this.answers = [];
    list.forEach((element: any & { id: string }) => {
      this.answers.push(this.setMessageObject(element.data(), element.id));
    });
    this.answers = this.sortByDate(this.answers);
  }


  /**
   * Processes a list of chat documents and updates the local messages array.
   * 
   * This function clears the current messages array and populates it with 
   * new message objects created from the provided list. Each element in the 
   * list is transformed into a message object using the setMessageObject 
   * method. After populating the array, the messages are sorted by date.
   * 
   * @param list - A collection of chat documents to be processed.
   */
  safeChatData(list: any): void {
    this.messages = [];
    list.forEach((element: any & { id: string }) => {
      this.messages.push(this.setMessageObject(element.data(), element.id))
    });
    this.messages = this.sortByDate(this.messages);
  }


  /**
   * We check if nothing is undefinend.
   * @param element - is the array in the Firebase where the message are saved
   * @returns - return the filled array
   */
  setMessageObject(element: any, id: string): MessageInterface {
    return {
      content: element.content || '',
      isRead: element.isRead || false,
      senderID: element.senderID || 0,
      senderName: element.senderName || '',
      senderAvatar: element.senderAvatar || '',
      date: new Date(element.date) || 0,
      messageID: id || '',
    }
  }


  /**
   * Sort the array by the dates
   * @param messages - the array
   * @returns - return the sorted array
   */
  sortByDate(messages: MessageInterface[]): MessageInterface[] {
    return messages.sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    });
  }


  /**
 * We create a user array with his id and add this to the firebase
 * @param user - the array with all user data
 */
  createChat(user: any): void {
    let users = {
      user1: user.userID,
      user2: this.authService.currentUserSig()?.userID,
    }
    this.addChat(users)
  }


  /**
   * Creates a reaction for a message and add it to the database
   * @param messageID - the ID of the message that the reaction belongs to
   * @param collectionOfMessage - the name of the collection of messages in the database
   */
  createReaktion(messageID: string, collectionOfMessage: string): void {
    let date = new Date();
    let timeStamp = date.getTime();
    let reaction = {
      content: this.reaktionContent,
      senderIDs: [
        this.authService.currentUserSig()?.userID,
      ],
      senderNames: [
        this.authService.currentUserSig()?.username,
      ],
      latestReactionTime: timeStamp,
    }
    this.addSomethingToMessage(messageID, collectionOfMessage, reaction, false);
  }



  /**
   * Creates a message and adds it to the database.
   * 
   * @param messageID - the ID of the message that should be created
   * @param collectionOfMessage - the name of the collection of messages in the database
   * @param mentionedUsers - the user that are mentioned in the message
   * @param chartID - the ID of the chart that the message belongs to
   * @param chartOrChannel - the type of the channel that the message belongs to
   */
  createMessage(messageID: string, collectionOfMessage: string, mentionedUsers: any, chartID?: string, chartOrChannel?: string): void {
    let date = new Date();
    let timeStamp = date.getTime();
    let message = {};
    if (messageID == 'noID') {
      this.createNormalMessage(message, timeStamp, messageID, collectionOfMessage, mentionedUsers, chartID, chartOrChannel);
    } else {
      this.createAnswerMessage(message, timeStamp, messageID, collectionOfMessage, mentionedUsers)
    }
  }


  /**
   * Creates a normal message and adds it to the database.
   * 
   * @param message - the message that should be created
   * @param timeStamp - the timestamp of the message
   * @param messageID - the ID of the message that should be created
   * @param collectionOfMessage - the name of the collection of messages in the database
   * @param mentionedUsers - the user that are mentioned in the message
   * @param chartID - the ID of the chart that the message belongs to
   * @param chartOrChannel - the type of the channel that the message belongs to
   */
  createNormalMessage(message: any, timeStamp: number, messageID: string, collectionOfMessage: string, mentionedUsers: any, chartID?: string, chartOrChannel?: string): void {
    message = {
      content: this.content,
      senderID: this.authService.currentUserSig()?.userID,
      senderName: this.authService.currentUserSig()?.username,
      senderAvatar: this.authService.currentUserSig()?.avatar,
      date: timeStamp,
    };
    this.content = '';
    this.addSomethingToMessage(messageID, collectionOfMessage, message, mentionedUsers, chartID, chartOrChannel);
  }


  /**
   * Creates an answer message and adds it to the database.
   * 
   * @param message - the answer message that should be created
   * @param timeStamp - the timestamp of the answer message
   * @param messageID - the ID of the message to which the answer is given
   * @param collectionOfMessage - the name of the collection of messages in the database
   * @param mentionedUsers - the user that are mentioned in the answer message
   */
  createAnswerMessage(message: any, timeStamp: number, messageID: string, collectionOfMessage: string, mentionedUsers: any): void {
    message = {
      content: this.answerContent,
      senderID: this.authService.currentUserSig()?.userID,
      senderName: this.authService.currentUserSig()?.username,
      senderAvatar: this.authService.currentUserSig()?.avatar,
      date: timeStamp,
    };
    this.answerContent = '';
    this.addSomethingToMessage(messageID, collectionOfMessage, message, mentionedUsers);
  }



  /**
   * Adds a document to a collection of messages in the database.
   * If the document is successfully added, it calls the addMentionsToSameMessage function.
   * @param messageID - the ID of the message that the document belongs to
   * @param collectionOfMessage - the name of the collection of messages in the database
   * @param array - the data of the document to be added
   * @param mentionedUsers - the users that are mentioned in the message
   * @param chartID - the ID of the chart that the message belongs to
   * @param chartOrChannel - the type of the channel that the message belongs to
   */
  async addSomethingToMessage(messageID: string, collectionOfMessage: string, array: any, mentionedUsers: any, chartID?: string, chartOrChannel?: string): Promise<void> {
    const ref = `${this.checkCollectionChatOrChannel(chartOrChannel)}/${this.checkDocChatIDOrChannelID(chartID, chartOrChannel)}/messages${this.checkCollectionOfMessage(messageID, collectionOfMessage)}`
    await addDoc(collection(this.firestore, ref), array).catch(
      (err) => {
        console.error(err);
      }
    ).then(
      (docRef) => {
        this.addMentionsToSameMessage(mentionedUsers, docRef);
      }
    )
  }


  /**
   * Adds all the mentioned users to the same message in the database.
   * It iterates through the array of mentioned users and calls the addMentionUser function for each user.
   * @param mentionedUsers - the array of mentioned users
   * @param docRef - the document reference of the message that the mentioned users belong to
   */
  addMentionsToSameMessage(mentionedUsers: any, docRef: any): void {
    for (let i = 0; i < mentionedUsers.length; i++) {
      const mentionedUser = mentionedUsers[i];
      if (docRef?.id) {
        this.addMentionUser(docRef?.id, mentionedUser);
      }
    }
  }


  /**
   * Adds a mentioned user to the list of mentioned users in the database.
   * The mentioned user is added to the subcollection of the message document in the database.
   * @param messageId - the ID of the message to which the mentioned user belongs
   * @param mentionedUser - the data of the mentioned user
   */
  async addMentionUser(messageId: string, mentionedUser: any): Promise<void> {
    await addDoc(collection(this.firestore, `channels/${this.messengerService.channel.channelID}/messages/${messageId}/mentions`), mentionedUser).catch(
      (err) => {
        console.error(err);
      }
    )
  }


  /**
   * Searches for a chat in the database with the given user ID and the current user ID.
   * If a chat is found, it calls the callback function with the chat ID.
   * If no chat is found, it calls the tryOtherSearchMethod function.
   *
   * @param user - The user object to search for
   * @param newMessageComponent - Optional flag indicating if the new message component is active
   * @param callback - Optional callback function to call with the chat ID
   */
  searchChat(user: any, newMessageComponent?: boolean, callback?: any): any {
    this.messengerService.chartId = '';
    let alreadyTriedOtherOptins = false;
    let messegaRef = query(collection(this.firestore, 'chats'), where('user1', '==', user.userID), where('user2', '==', this.authService.currentUserSig()?.userID));
    if (this.tryOtherOption) {
      messegaRef = query(collection(this.firestore, 'chats'), where('user2', '==', user.userID), where('user1', '==', this.authService.currentUserSig()?.userID));
      this.tryOtherOption = false;
      alreadyTriedOtherOptins = true;
    }
    return onSnapshot(messegaRef, (list) => {
      list.forEach(element => {
        this.messengerService.chartId = element.id
        if (callback) {
          callback(element.id);
        }
      })
      this.checkIfChartIdIsEmpty(user, newMessageComponent, alreadyTriedOtherOptins);
    })
  }


  /**
   * Checks if the chart ID is empty and takes appropriate actions.
   *
   * This function sets a timeout to check if the chart ID in the messenger service
   * is empty. If it is empty, it calls `tryOtherSearchMethod` with the given parameters.
   * If the chart ID is not empty, it calls `openChartAndClearArrays` with the `newMessageComponent` parameter.
   *
   * @param user - The user object for whom the chart ID is being checked.
   * @param newMessageComponent - Optional flag indicating if the new message component is active.
   * @param alreadyTriedOtherOptins - Optional flag indicating if other options have already been tried.
   */
  checkIfChartIdIsEmpty(user: any, newMessageComponent?: boolean, alreadyTriedOtherOptins?: boolean) {
    setTimeout(() => {
      if (this.messengerService.chartId == '') {
        this.tryOtherSearchMethod(user, newMessageComponent, alreadyTriedOtherOptins);
      } else if (this.messengerService.chartId != '') {
        this.openChartAndClearArrays(newMessageComponent);
      }
    });
  }


  /**
   * If the searchChat function did not find any chat with the given user ID, we try the other option.
   * If the other option also did not find any chat, we create a new chat with the given user.
   * @param user - the user to search for
   * @param newMessageComponent - if the searchChat function should be called with the newMessageComponent parameter set to true
   * @param alreadyTriedOtherOptins - if the other option has already been tried
   */
  tryOtherSearchMethod(user: any, newMessageComponent?: boolean, alreadyTriedOtherOptins?: boolean): void {
    this.tryOtherOption = true;
    if (newMessageComponent === true) {
      this.searchChat(user, true);
    } else {
      this.searchChat(user);
    }
    if (alreadyTriedOtherOptins) {
      this.createChat(user);
    }
  }


  /**
   * Opens the messenger UI for a direct message conversation with the given user.
   * It first clears the arrays of message dates and messages, then sets the messenger service to open the chart.
   * If the newMessageComponent parameter is not set to true, it also sets the messenger service to open the messenger
   * and calls the scrollToBottom method to scroll to the bottom of the messenger.
   * @param newMessageComponent - if the messenger service should be set to open the new message component
   */
  openChartAndClearArrays(newMessageComponent?: boolean): void {
    this.messengerService.messageDates = [];
    this.messages = [];
    if (newMessageComponent !== true) {
      this.messengerService.openMessenger = true;
      this.subSomethingList('noID', 'noCollection', () => {
        setTimeout(() => {
          this.messengerService.scrollToBottom(this.messengerService.scrollContainer);
        }, 10);
      });
    }
  }


  
  /**
   * Searches for a channel with the given title in the database.
   * If a channel is found, it calls the callback function with the channel ID.
   * @param channel - The channel object to search for
   * @param callback - Optional callback function to call with the channel ID
   */
  searchChannel(channel: any, callback?: any): DocumentData {
    this.messengerService.channel.channelID = '';
    let alreadyTriedOtherOptins = false;
    let messegaRef = query(collection(this.firestore, 'channels'), where('title', '==', channel.title));
    return onSnapshot(messegaRef, (list) => {
      list.forEach(element => {
        this.messengerService.chartId = element.id
        if (callback) {
          callback(element.id);
        }
      })
    })
  }


  /**
   * Updates a document in the database with the given ID and data.
   * @param messageID - the ID of the message that the document belongs to
   * @param collectionOfMessage - the name of the collection of messages in the database
   * @param docID - the ID of the document to be updated
   * @param array - the new data to update the document with
   * @returns a promise that resolves when the document is updated
   */
  async updateSomethingAtMessage(messageID: string, collectionOfMessage: string, docID: string, array: any,): Promise<void> {
    let ref = doc(collection(this.firestore, `${this.checkCollectionChatOrChannel()}/${this.checkDocChatIDOrChannelID()}/messages${this.checkCollectionOfMessage(messageID, collectionOfMessage)}`), docID);
    await updateDoc(ref, this.whatShouldBeUpdated(array, collectionOfMessage)).catch(
      (err) => {
        console.error(err);
      }
    )
  }


  /**
   * Extracts and returns a simplified JSON object from a given message object.
   * 
   * The returned JSON object includes the message content, sender ID, and the 
   * date in milliseconds since the Unix Epoch, derived from the message's date.
   * 
   * @param message - The message object to be processed.
   * @returns {object} A JSON object containing content, senderId, and date.
   */
  whatShouldBeUpdated(message: any, collectionOfMessage: string): object {
    if (collectionOfMessage == 'reaction') {
      return {
        senderIDs: message.senderIDs,
        senderNames: message.senderNames,
      }
    } else {
      return {
        content: message.content,
        senderId: message.senderID,
        date: message.date.getTime(),
      }
    }
  }


  /**
   * Creates a new chat document in Firestore with the given users array.
   * The users array should contain the IDs of the two users participating in the chat.
   * @param users - The users array to add to the chat document.
   */
  async addChat(users: any): Promise<void> {
    await addDoc(collection(this.firestore, `chats`), users).catch(
      (err) => {
        console.error(err);
      }
    )
  }


  /**
   * Extracts and returns a clean reaction object containing only the sender IDs 
   * and sender names from the provided reaction data.
   * 
   * @param reaction - The reaction data object containing various details.
   * @returns {object} An object with `senderIDs` and `senderNames` extracted from the reaction.
   */
  getCleanReaction(reaction: any): object {
    return {
      senderIDs: reaction.senderIDs,
      senderNames: reaction.senderNames,
    }
  }


  /**
   * Determines the collection type based on the current context.
   * 
   * @returns {string} - Returns 'chats' if the messenger service is in chat mode,
   * otherwise returns 'channels'.
   */
  checkCollectionChatOrChannel(chartOrChannel?: string): string {
    if (chartOrChannel !== undefined) {
      if (chartOrChannel == 'chart') {
        return 'chats';
      } else {
        return 'channels';
      }
    } else if (this.messengerService.openChart) {
      return 'chats';
    } else {
      return 'channels';
    }
  }


  /**
   * Return the document ID for the chat or channel.
   * If openChart is true, return the chartId.
   * If openChannel is true, return the channelID.
   * Otherwise, return an empty string.
   * @returns {string} - the document ID
   */
  checkDocChatIDOrChannelID(chartID?: string, chartOrChannel?: string): string {
    if (this.messengerService.openChart || chartOrChannel === 'chart') {
      return chartID !== undefined ? `${chartID}` : `${this.messengerService.chartId}`
    } else if (this.messengerService.openChannel || chartOrChannel === 'channel') {
      return chartID !== undefined ? `${chartID}` : `${this.messengerService.channel.channelID}`
    } else {
      return '';
    }
  }


  /**
   * Check the collection of a message.
   * @param messageID - The id of the message
   * @param collection - The collection of the message (answer, reaction, mention)
   * @returns {string} The path of the collection
   */
  checkCollectionOfMessage(messageID: string, collection: string): string {
    if (collection == 'answer') {
      return `/${messageID}/answers`;
    } else if (collection == 'reaction') {
      return `/${messageID}/reactions`;
    } else if (collection == 'mention') {
      return `/${messageID}/mentions`;
    } else {
      return '';
    }
  }
}