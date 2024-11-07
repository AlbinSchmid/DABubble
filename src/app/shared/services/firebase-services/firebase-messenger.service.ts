import { inject, Injectable } from '@angular/core';
import { addDoc, collection, Firestore, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { deleteDoc, doc, query, where, } from 'firebase/firestore';
import { MessageInterface } from '../../interfaces/message-interface';
import { ThreadService } from '../thread-service/thread.service';
import { list } from '@angular/fire/storage';
import { MessengerService } from '../messenger-service/messenger.service';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { user } from '@angular/fire/auth';
import { ReactionInterface } from '../../interfaces/reaction-interface';

@Injectable({
  providedIn: 'root'
})
export class FirebaseMessengerService {
  firestore: Firestore = inject(Firestore);
  authService = inject(AuthserviceService);

  content = '';
  answerContent = '';
  reaktionContent = '';

  messages: MessageInterface[] = [];
  answers: MessageInterface[] = [];
  reactions: ReactionInterface[] = [];

  tryOtherOption: boolean;
  messageOrThread: string;


  constructor(private threadService: ThreadService, private messengerService: MessengerService) { }


  async deleteReaction(messageID: string, reaktionID: string) {
    const chatOrChannelPath = this.checkCollectionChatOrChannel();
    const chatIdOrChannelId = this.messengerService.chartId || this.messengerService.channel?.channelID;
    if (!chatIdOrChannelId) {
      return;
    }
    const path = `${chatOrChannelPath}/${chatIdOrChannelId}/messeges/${messageID}/reactions/${reaktionID}`;
    try {
      await deleteDoc(doc(this.firestore, path));
    } catch (error) {
      console.error('Error deleting reaction:', error);
    }
  }


  /**
   * 
   * @returns Get the path of the messeges of 1 chat
   */
  subChatsList() {
    const messegeRef = collection(this.firestore, `${this.checkCollectionChatOrChannel()}/${this.checkDocChatOrChannel()}/messeges`)
    return onSnapshot(messegeRef, (list) => {
      this.messages = [];
      list.forEach(element => {
        this.messages.push(this.setMessageObject(element.data(), element.id))
      });
      this.messages = this.sortByDate(this.messages);
      setTimeout(() => {
        this.messengerService.scrollToBottom(this.messengerService.scrollContainer);
      });
    })
  }


  /**
   * 
   * @param messageId - messageId where we get the answeres
   * @returns get the path of the answere chat
   */
  subAnswersList() {
    const messegeRef = collection(this.firestore, `${this.checkCollectionChatOrChannel()}/${this.checkDocChatOrChannel()}/messeges/${this.threadService.messageToReplyTo.messageID}/answers`);
    return onSnapshot(messegeRef, (list) => {
      this.answers = [];
      list.forEach(element => {
        this.answers.push(this.setMessageObject(element.data(), element.id));
      });
      this.answers = this.sortByDate(this.answers);
      setTimeout(() => {
        this.messengerService.scrollToBottom(this.threadService.scrollContainer)
      });
    })
  }


  /**
   * We check if nothing is undefinend.
   * @param element - is the array in the Firebase where the message are saved
   * @returns - return the filled array
   */
  setMessageObject(element: any, id: string) {
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


  createReaktion(messageId: string) {
    let reaction = {
      content: this.reaktionContent,
      senderIDs: [
        this.authService.currentUserSig()?.userID,
      ],
      senderNames: [
        this.authService.currentUserSig()?.username,
      ],
    }

    this.addReaction(messageId, reaction)
  }


  /**
   * Get the time when message is created and filled the array. 
   */
  // createAnswer(messageID: string, collectionOfMessage: string) {
  //   let date = new Date();
  //   let timeStamp = date.getTime();
  //   let message = {
  //     content: this.answerContent,
  //     senderID: this.authService.currentUserSig()?.userID,
  //     senderName: this.authService.currentUserSig()?.username,
  //     senderAvatar: this.authService.currentUserSig()?.avatar,
  //     date: timeStamp,
  //   }
  //   this.addMessage(messageID, collectionOfMessage, message, false);
  //   this.answerContent = '';
  // }


  /**
   * Get the time when message is created and filled the array. 
   */
  createMessage(messageID: string | boolean, collectionOfMessage: string, mentionedUsers: any) {
    let date = new Date();
    let timeStamp = date.getTime();
    let message = {
      content: this.content,
      senderID: this.authService.currentUserSig()?.userID,
      senderName: this.authService.currentUserSig()?.username,
      senderAvatar: this.authService.currentUserSig()?.avatar,
      date: timeStamp,
    }

    this.addMessage(messageID, collectionOfMessage, message, mentionedUsers);
    this.content = '';
  }


  /**
   * We save the message in our firebase.
   * @param message - the sent message
   */
  async addMessage(messageID: string | boolean, collectionOfMessage: string, array: any, mentionedUsers: any) {
    await addDoc(collection(this.firestore, `${this.checkCollectionChatOrChannel()}/${this.checkDocChatOrChannel()}/messeges${this.checkCollectionOfMessage(messageID)}`), array).catch(
      (err) => {
        console.error(err);
      }
    ).then(
      (docRef) => {
        for (let i = 0; i < mentionedUsers.length; i++) {
          const mentionedUser = mentionedUsers[i];
          if (docRef?.id) {
            this.addMentionUser(docRef?.id, mentionedUser);
          }
        }
        console.log('Document written with ID: ', docRef?.id);
      }
    )
  }


  async addMentionUser(messageId: string, mentionedUser: any) {
    await addDoc(collection(this.firestore, `channels/${this.messengerService.channel.channelID}/messeges/${messageId}/mentioned`), mentionedUser).catch(
      (err) => {
        console.error(err);
      }
    ).then(
      (docRef) => {
        console.log('Document written with ID: ', docRef?.id);
      }
    )
  }


  async addReaction(messageId: string, reaction: any) {
    await addDoc(collection(this.firestore, `${this.checkCollectionChatOrChannel()}/${this.checkDocChatOrChannel()}/messeges/${messageId}/reactions`), reaction).catch(
      (err) => {
        console.error(err);
      }
    ).then(
      (docRef) => {
        console.log('Document written with ID: ', docRef?.id);
      }
    )
  }


  /**
   * we search with the user ID, if we have already a chat with this user
   * @param userID - the user ID
   * @returns - return the element with this user
   */
  searchChat(user: any) {
    let alreadyTriedOtherOptins = false;
    let messegeRef = query(collection(this.firestore, 'chats'), where('user1', '==', user.userID), where('user2', '==', this.authService.currentUserSig()?.userID));
    if (this.tryOtherOption) {
      messegeRef = query(collection(this.firestore, 'chats'), where('user2', '==', user.userID), where('user1', '==', this.authService.currentUserSig()?.userID));
      this.tryOtherOption = false;
      alreadyTriedOtherOptins = true;
    }
    return onSnapshot(messegeRef, (list) => {
      list.forEach(element => {
        this.messengerService.chartId = element.id
      })
      if (this.messengerService.chartId == '') {
        this.tryOtherOption = true;
        this.searchChat(user);
        if (alreadyTriedOtherOptins) {
          this.createChat(user);
        }
      } else {
        this.messengerService.showMessenger = true;
      }
    })
  }


  /**
   * We create a user array with his id and add this to the firebase
   * @param user - the array with all user data
   */
  createChat(user: any) {
    let users = {
      user1: user.userID,
      user2: this.authService.currentUserSig()?.userID,
    }
    this.addChat(users)
  }


  /**
   * We add a new chat in firebase
   * @param users - the users array form the funtion createChat
   */
  async addChat(users: any) {
    await addDoc(collection(this.firestore, `chats`), users).catch(
      (err) => {
        console.error(err);
      }
    ).then(
      (docRef) => {
        console.log('Document written with ID: ', docRef?.id);
      }
    )
  }




  /**
   * We update the message in the firebase
   * @param message - message array
   * @param messageId - message id (firebase)
   */
  async updateMessage(message: any, messageId: string) {
    let ref = this.getSingleDocRef(messageId);
    await updateDoc(ref, this.getCleanJson(message)).catch(
      (err) => {
        console.error(err);
      }
    )
  }


  async updateAnswer(message: any, answerId: string) {
    let ref = doc(collection(this.firestore, `${this.checkCollectionChatOrChannel()}/${this.checkDocChatOrChannel()}/messeges/${this.threadService.messageId}/answers`), answerId);
    await updateDoc(ref, this.getCleanJson(message)).catch(
      (err) => {
        console.error(err);
      }
    )
  }



  async updateReaction(reaction: any, messageID: string, reactionID: string) {
    let ref = doc(collection(this.firestore, `${this.checkCollectionChatOrChannel()}/${this.checkDocChatOrChannel()}/messeges/${messageID}/reactions`), reactionID);
    await updateDoc(ref, this.getCleanReaction(reaction)).catch(
      (err) => {
        console.error(err);
      }
    )
  }


  getCleanReaction(reaction: any) {
    return {
      senderIDs: reaction.senderIDs,
      senderNames: reaction.senderNames,
    }
  }


  /**
   * Everything in this should be updated
   * @param message - message array
   * @returns - clean array
   */
  getCleanJson(message: any) {
    return {
      content: message.content,
      isRead: message.isRead,
      senderId: message.senderID,
      date: message.date.getTime(),
    }
  }


  checkCollectionChatOrChannel() {
    if (this.messengerService.openChart) {
      return 'chats';
    } else {
      return 'channels';
    }
  }


  checkDocChatOrChannel() {
    if (this.messengerService.openChart) {
      return `${this.messengerService.chartId}`;
    } else {
      return `${this.messengerService.channel.channelID}`;
    }
  }



  /**
   * we check where the message should be saved in the firebase
   * @param messageId - id from the message
   * @returns - return the path where should be saved in the firebase
   */
  checkCollectionOfMessage(messageId: string | boolean) {
    if (messageId == false) {
      return '';
    } else {
      return `/${messageId}/answers`;
    }
  }


  /**
   * Get single path in firebase
   * @param messageId - the messageId in this path of chat
   * @returns - returns the correct path
   */
  getSingleDocRef(messageId: string) {
    return doc(collection(this.firestore, `${this.checkCollectionChatOrChannel()}/${this.checkDocChatOrChannel()}/messeges`), messageId)
  }


  /**
   * get Acces of chats in firebase
   * @returns - returns the path of firebase chats
   */
  getChatsRef() {
    return collection(this.firestore, 'chats');
  }
}