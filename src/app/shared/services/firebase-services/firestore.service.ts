import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../../interfaces/channel';

type EntityTypes = UserInterface | Channel;

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  firestore: Firestore = inject(Firestore);

  userList: UserInterface[] = [];
  channelList: Channel[] = [];

  unsubList!: () => void;

  constructor() { }

  /**
   * Starts a Firestore snapshot listener for the specified collection ID.
   * @param {string} collId - The collection ID to start the snapshot for (e.g., 'users' or 'channels').
   */
  startSnapshot(collId: string) {
    if (collId === 'users') this.startUserSnapshot(collId);
    if (collId === 'channels') this.startChannelSnapshot(collId);
  }

  /**
   * Sets up a snapshot listener for the 'users' collection.
   * @param {string} collId - The collection ID for the users (typically 'users').
   */
  startUserSnapshot(collId: string) {
    this.unsubList = onSnapshot(this.getCollectionRef(collId), (list) => {
      this.userList = [];
      list.forEach(el => {
        let userObj = this.setDummyObject(el.data() as UserInterface, el.id) as UserInterface;
        this.userList.push(userObj);
      });
      console.log(this.userList);
    });
  }

  /**
   * Sets up a snapshot listener for the 'channels' collection.
   * @param {string} collId - The collection ID for the channels (typically 'channels').
   */
  startChannelSnapshot(collId: string) {
    this.unsubList = onSnapshot(this.getCollectionRef(collId), (list) => {
      this.channelList = [];
      list.forEach(el => {
        let channelObj = this.setDummyObject(el.data() as Channel, el.id) as Channel;
        this.channelList.push(channelObj);
      });
      console.log(this.channelList);
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
   * @param {EntityTypes} obj - The object to be added (either a `UserInterface` or `Channel`).
   * @param {string} callId - The collection ID to add the document to.
   */
  async addDoc(obj: EntityTypes, callId: string) {
    await addDoc(this.getCollectionRef(callId), obj).catch(
      (err) => { console.error(err); }
    ).then(
      (docRef) => { console.log(docRef?.id); }
    );
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
   * @param {EntityTypes} obj - The original object to create a dummy from.
   * @param {string} id - The ID to be assigned to the dummy object.
   * @returns {EntityTypes} - The newly created dummy object.
   */
  setDummyObject(obj: EntityTypes, id: string): EntityTypes {
    if (this.isUserInterface(obj)) return this.getUserDummyObject(obj, id);
    if (this.isChannel(obj)) return this.getChannelDummyObject(obj, id);

    throw new Error('Invalid object type');
  }

  /**
   * Checks if an object is of type `UserInterface`.
   * @param {EntityTypes} obj - The object to check.
   * @returns {obj is UserInterface} - True if the object is a `UserInterface`.
   */
  isUserInterface(obj: EntityTypes): obj is UserInterface {
    return 'userID' in obj;
  }

  /**
   * Checks if an object is of type `Channel`.
   * @param {EntityTypes} obj - The object to check.
   * @returns {obj is Channel} - True if the object is a `Channel`.
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
      userStatus : obj.userStatus,
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
      user: obj.user,
      messages: obj.messages,
    };
  }

  /**
   * Retrieves a document from Firestore based on its ID.
   * @param {string} docId - The ID of the document to retrieve.
   * @returns {Promise<any>} - The document data from Firestore.
   */
  async getObjectById(docId: string) {
    let obj = await getDoc(this.getSingleDocRef(docId));
    return obj;
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
