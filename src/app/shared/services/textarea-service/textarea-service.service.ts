import { inject, Injectable } from '@angular/core';
import { MentionUserInterface } from '../../interfaces/mention-user-interface';
import { collection, doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { MessengerService } from '../messenger-service/messenger.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { FirestoreService } from '../firebase-services/firestore.service';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';

@Injectable({
  providedIn: 'root'
})
export class TextareaServiceService {
  authService = inject(AuthserviceService);
  firestore = inject(Firestore);
  messengerService = inject(MessengerService);
  firestoreService = inject(FirestoreService);

  usersListAll: UserInterface[] = [];
  usersToMention: MentionUserInterface[] = [];
  userListSubscription: any;


  // subChannelList(callback?: any) { 
  //   this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
  //     this.usersListAll = users;
  //   });
  //   const messegeRef = doc(collection(this.firestore, `channels`), this.messengerService.channel.channelID);
  //   return onSnapshot(messegeRef, (list) => {
  //     if (list.exists()) {
  //       this.usersToMention = [];
  //       this.messengerService.mentionConfig.items = [];
  //       const usersIDs = list.data()['userIDs'];
  //       for (let i = 0; i < usersIDs.length; i++) {
  //         const userID = usersIDs[i];
  //         const user = this.usersListAll.filter(user => user.userID === userID);
  //         this.usersToMention.push(this.getCleanJson(user));
  //         this.usersToMention = this.usersToMention.filter(user => user.userID !== this.authService.currentUserSig()?.userID);
  //       }
  //       this.sortByName(this.usersToMention);
  //       if (callback) {
  //         callback(this.usersToMention);
  //       }
  //     } else {
  //       console.error("doc is empty or doesn't exist");
  //     }
  //   })
  // }


  sortByName(array: any[]) {
    array.sort((a, b) => {
      const nameA = a?.userName || '';
      const nameB = b?.userName || '';
      return nameA.localeCompare(nameB);
    });
  }


  getCleanJson(user: UserInterface[]) {
    let userJson = {
      avatar: user[0]['avatar'],
      userID: user[0]['userID'],
      userName: user[0]['username'],
    }
    return userJson;
  }
}
