import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../../interfaces/channel';
import { BehaviorSubject } from 'rxjs';

type EntityTypes = UserInterface | Channel;

/**
 * Service for managing Firestore operations, including creating, updating, deleting,
 * and listening to changes in Firestore collections and documents.
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  firestore: Firestore = inject(Firestore);

  userList$ = new BehaviorSubject<UserInterface[]>([]);
  channelList$ = new BehaviorSubject<Channel[]>([]);
  unsubList!: () => void;

  constructor() { }

  /**
   * Starts a Firestore snapshot listener for the specified collection ID.
   * Depending on the collection ID ('users' or 'channels'), this method calls the appropriate snapshot handler.
   * @param {string} collId - The collection ID to listen to (e.g., 'users' or 'channels').
   */
  startSnapshot(collId: string) {
    if (collId === 'users') this.startUserSnapshot(collId);
    if (collId === 'channels') this.startChannelSnapshot(collId);
  }

  /**
   * Sets up a snapshot listener for the 'users' collection and updates the `userList$` observable.
   * Filters out unwanted users, sorts the remaining users by username, and pushes the result to `userList$`.
   * @param {string} collId - The collection ID to listen to (typically 'users').
   */
  startUserSnapshot(collId: string) {
    this.unsubList = onSnapshot(this.getCollectionRef(collId), (snapshot) => {
      let userList: UserInterface[] = [];
      snapshot.forEach(doc => {
        let userObj = this.setDummyObject(doc.data() as UserInterface, doc.id) as UserInterface;
        userList.push(userObj);
      });

      // Filter out unwanted users and sort by username
      userList = userList.filter(user => user.username !== 'Neuer Gast');
      userList.sort((a, b) => a.username.localeCompare(b.username));
      this.userList$.next(userList);
    });
  }

  /**
   * Sets up a snapshot listener for the 'channels' collection and updates the `channelList$` observable.
   * Sorts the channels by their title in alphabetical order and pushes the sorted list to `channelList$`.
   * @param {string} collId - The collection ID to listen to (typically 'channels').
   */
  startChannelSnapshot(collId: string) {
    this.unsubList = onSnapshot(this.getCollectionRef(collId), (snapshot) => {
      let channelList: Channel[] = [];
      snapshot.forEach(doc => {
        let channelObj = this.setDummyObject(doc.data() as Channel, doc.id) as Channel;
        channelList.push(channelObj);
      });

      // Sort channels alphabetically by title
      channelList.sort((a, b) => a.title.localeCompare(b.title));
      this.channelList$.next(channelList);
    });
  }

  /**
   * Stops the currently active Firestore snapshot listener, if one exists.
   */
  stopSnapshot() {
    if (this.unsubList) {
      this.unsubList();
    }
  }

  /**
   * Adds a new document to the specified Firestore collection.
   * @param {EntityTypes} obj - The entity to be added (either a `UserInterface` or a `Channel` object).
   * @param {string} collId - The collection ID to add the document to.
   */
  async addDoc(obj: EntityTypes, collId: string) {
    await addDoc(this.getCollectionRef(collId), obj)
      .then(docRef => console.log(docRef?.id))
      .catch(err => console.error(err));
  }

  /**
   * Deletes a document from a specified Firestore collection.
   * @param {string} collId - The collection ID where the document is located.
   * @param {string} docId - The ID of the document to be deleted.
   */
  async deleteDoc(collId: string, docId: string) {
    await deleteDoc(doc(this.firestore, collId, docId));
  }

  /**
   * Creates a dummy object for either a user or a channel based on the provided entity type.
   * @param {EntityTypes} obj - The original entity to create a dummy from.
   * @param {string} id - The ID to be assigned to the dummy object.
   * @returns {EntityTypes} - The newly created dummy entity.
   * @throws Will throw an error if the entity type is not recognized.
   */
  setDummyObject(obj: EntityTypes, id: string): EntityTypes {
    if (this.isUserInterface(obj)) return this.getUserDummyObject(obj, id);
    if (this.isChannel(obj)) return this.getChannelDummyObject(obj, id);

    throw new Error('Invalid object type');
  }

  /**
   * Checks if the given entity is of type `UserInterface`.
   * @param {EntityTypes} obj - The entity to check.
   * @returns {obj is UserInterface} - True if the entity is a `UserInterface`.
   */
  isUserInterface(obj: EntityTypes): obj is UserInterface {
    return 'userID' in obj;
  }

  /**
   * Checks if the given entity is of type `Channel`.
   * @param {EntityTypes} obj - The entity to check.
   * @returns {obj is Channel} - True if the entity is a `Channel`.
   */
  isChannel(obj: EntityTypes): obj is Channel {
    return 'createdBy' in obj;
  }

  /**
   * Creates a new dummy user object based on the provided `UserInterface` and ID.
   * @param {UserInterface} obj - The original user object.
   * @param {string} id - The ID to be assigned to the dummy object.
   * @returns {UserInterface} - The newly created dummy user object.
   */
  getUserDummyObject(obj: UserInterface, id: string): UserInterface {
    return {
      userID: id,
      password: obj.password,
      email: obj.email,
      username: obj.username,
      avatar: obj.avatar,
      userStatus: obj.userStatus,
      isFocus: obj.isFocus,
    };
  }

  /**
   * Creates a new dummy channel object based on the provided `Channel` and ID.
   * @param {Channel} obj - The original channel object.
   * @param {string} id - The ID to be assigned to the dummy object.
   * @returns {Channel} - The newly created dummy channel object.
   */
  getChannelDummyObject(obj: Channel, id: string): Channel {
    return {
      channelID: id,
      title: obj.title,
      description: obj.description,
      createdBy: obj.createdBy,
      isFocus: obj.isFocus,
      user: obj.user,
      messages: obj.messages,
    };
  }

  /**
   * Retrieves a document from Firestore based on its ID.
   * @param {string} docId - The ID of the document to retrieve.
   * @returns {Promise<any>} - The document data retrieved from Firestore.
   */
  async getObjectById(docId: string) {
    const docSnapshot = await getDoc(this.getSingleDocRef(docId));
    return docSnapshot;
  }

  /**
   * Updates an existing Firestore document with the provided data.
   * @param {string} docId - The ID of the document to update.
   * @param {Object} updatedDoc - The new data to update the document with.
   */
  async updateDoc(docId: string, updatedDoc: {}) {
    await updateDoc(this.getSingleDocRef(docId), updatedDoc);
  }

  /**
   * Returns a reference to a Firestore collection based on its ID.
   * @param {string} collId - The ID of the collection.
   * @returns {CollectionReference} - The Firestore collection reference.
   */
  getCollectionRef(collId: string) {
    return collection(this.firestore, collId);
  }

  /**
   * Returns a reference to a specific document within the 'users' collection.
   * @param {string} userId - The ID of the user document.
   * @returns {DocumentReference} - The Firestore document reference.
   */
  getSingleDocRef(userId: string) {
    return doc(collection(this.firestore, 'users'), userId);
  }
}
