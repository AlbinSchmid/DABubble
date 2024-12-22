import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Message } from '../../../models/message.class';
import { collection, doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { FirestoreService } from '../firebase-services/firestore.service';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  firestore: Firestore = inject(Firestore);
  firestoreService: FirestoreService = inject(FirestoreService);

  messageToReplyTo = new Message;
  usersInChannel: any[] = [];
  usersListAll: UserInterface[] = [];
  senderUser: UserInterface[] = [];

  messageId: string;
  senderAvatar: string;
  headerSenderName: string;
  messageToReplaySenderName: string;

  channelID: any;
  scrollContainer: any;
  userListSubscription: any;

  showThreadSideNav = false;
  showThread = false;
  openThreadContent = false;



  /**
   * Subscribes to the user list and checks if the message sender is a guest.
   * 
   * This method subscribes to the `userList$` observable from the Firestore service
   * to retrieve the list of users and assigns it to the `usersListAll` field. 
   * It then calls the `checkIfSenderIsGuest` method to determine if the sender 
   * of the message to reply to is a guest. Finally, it sets the `messageToReplaySenderName` 
   * and `headerSenderName` properties to the username of the sender.
   */
  getDataOfUser(): void {
    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      this.usersListAll = users;
    });
    this.checkIfSenderIsGuest();
    this.messageToReplaySenderName = this.senderUser[0].username;
    this.headerSenderName = this.senderUser[0].username;
  }


  /**
   * Checks if the sender of the message to reply to is a guest user.
   * If the sender is a guest user, it creates a fake user object with the given senderID and senderName.
   * The fake user object is stored in the `senderUser` property.
   */
  checkIfSenderIsGuest(): void {
    if (this.messageToReplyTo.senderName !== 'Neuer Gast') {
      this.senderUser = this.usersListAll.filter(user => user.userID === this.messageToReplyTo.senderID);
    } else {
      this.senderUser = [
        {
          userID: this.messageToReplyTo.senderID,
          password: '',
          email: '',
          username: this.messageToReplyTo.senderName,
          avatar: this.messageToReplyTo.senderAvatar,
          userStatus: '',
          isFocus: false,
        }
      ];
    }
  }



  /**
   * Subscribes to the list of users in the channel with the given ID.
   * When the list of users in the channel changes, it will update the usersInChannel array
   * and sort it by username.
   * @param callback - Optional callback function to call with the list of users in the channel.
   * @returns An unsubscribe function that can be used to stop listening to the list of users in the channel.
   */
  subChannelUserList(callback: any): any {
    const messegeRef = doc(collection(this.firestore, `channels`), this.channelID);
    return onSnapshot(messegeRef, (list) => {
      if (list.exists()) {
        if (callback) {
          callback(list);
        }
      }
    })
  }


  /**
   * Subscribes to the list of all users and to the list of users in the channel.
   * When the list of users in the channel changes, it will update the usersInChannel array
   * and sort it by username.
   */
  getTheUsersOfChannel(): void {
    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      let usersListAll = users;
      this.subChannelUserList((list: any) => {
        this.usersInChannel = [];
        const usersIDs = list.data()['userIDs'];
        for (let i = 0; i < usersIDs.length; i++) {
          const userID = usersIDs[i];
          const user = usersListAll.filter(user => user.userID === userID);
          this.usersInChannel.push(this.getCleanJson(user));
          this.sortByName(this.usersInChannel);
        }
      });
    });
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
      const nameA = a?.username || '';
      const nameB = b?.username || '';
      return nameA.localeCompare(nameB);
    });
  }


  /**
   * Constructs a simplified JSON object containing the user's ID, password, email, username, avatar, status, and focus flag.
   * The input array is expected to contain a single UserInterface object, and the resulting JSON object is
   * created from the data of the first element of the array.
   * @param user An array of UserInterface objects, expected to contain a single element.
   * @returns A JSON object with the user's ID, password, email, username, avatar, status, and focus flag.
   */
  getCleanJson(user: UserInterface[]): UserInterface {
    let userJson = {
      userID: user[0]['userID'],
      password: user[0]['password'],
      email: user[0]['email'],
      username: user[0]['username'],
      avatar: user[0]['avatar'],
      userStatus: user[0]['userStatus'],
      isFocus: user[0]['isFocus'],
    }
    return userJson;
  }
}
