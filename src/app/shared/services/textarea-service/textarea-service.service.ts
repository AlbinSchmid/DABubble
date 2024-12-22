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
   * Constructs a simplified JSON object containing the avatar, userID, and userName of a UserInterface object.
   * The input array is expected to contain a single UserInterface object, and the resulting JSON object is
   * created from the data of the first element of the array.
   * @param user An array of UserInterface objects, expected to contain a single element.
   * @returns A JSON object with the avatar, userID, and userName of the user.
   */
  getCleanJson(user: UserInterface[]): object {
    let userJson = {
      avatar: user[0]['avatar'],
      userID: user[0]['userID'],
      userName: user[0]['username'],
    }
    return userJson;
  }
}
