import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../../interfaces/channel';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  firestore: Firestore = inject(Firestore);
  user: UserInterface[] = [];
  channel: Channel[] = [];

  unsubList!: () => void;


  constructor() { }

  startSnapshot(collId: string) {
    if (collId == 'users') this.startUserSnapshot(collId);
    if (collId == 'channels') this.startChannelSnapshot(collId);
  }

  startUserSnapshot(collId: string) {
    this.unsubList = onSnapshot(this.getCollectionRef(collId), (list) => {
      this.user = [];
      list.forEach(el => {
        let userObj = this.setDummyObject(el.data() as UserInterface, el.id) as UserInterface;
        this.user.push(userObj);
      });
      console.log(this.user);
    });
  }

  startChannelSnapshot(collId: string) {
    this.unsubList = onSnapshot(this.getCollectionRef(collId), (list) => {
      this.channel = [];
      list.forEach(el => {
        let channelObj = this.setDummyObject(el.data() as Channel, el.id) as Channel;
        this.channel.push(channelObj);
      });
      console.log(this.channel);
    });
  }

  stopSnapshot() {
    if (this.unsubList) {
      this.unsubList();
    }
  }

  async addDoc(obj: UserInterface | Channel, callId: string) {
    await addDoc(this.getCollectionRef(callId), obj).catch(
      (err) => { console.error(err) }
    ).then(
      (docRef) => { console.log(docRef?.id) }
    );
  }

  async deleteDoc(collId: string, docId: string) {
    await deleteDoc(doc(this.firestore, collId, docId));
  }

  setDummyObject(obj: UserInterface | Channel, id: string): UserInterface | Channel {
    if (this.isUserInterface(obj)) return this.getUserDummyObject(obj, id);
    if (this.isChannel(obj)) return this.getChannelDummyObject(obj, id);

    throw new Error('Invalid object type');
  }

  isUserInterface(obj: any): obj is UserInterface {
    return 'userID' in obj;
  }

  isChannel(obj: any): obj is Channel {
    return 'channelID' in obj;
  }

  getUserDummyObject(obj: UserInterface, id: string) {
    return {
      userID: id,
      password: obj.password,
      email: obj.email,
      username: obj.username,
      avatar: obj.avatar
    }
  }

  getChannelDummyObject(obj: Channel, id: string) {
    return {
      channelID: id,
      title: obj.title,
      description: obj.description,
      createdBy: obj.createdBy,
      user: obj.user,
      messages: obj.messages,
    }
  }

  async getObjectById(docId: string) {
    let obj = await getDoc(this.getSingleDocRef(docId));
    return obj;
  }

  async updateDoc(docId: string, updatedDoc: {}) {
    await updateDoc(this.getSingleDocRef(docId), updatedDoc);
  }

  getCollectionRef(collId: string) {
    return collection(this.firestore, collId);
  }

  getSingleDocRef(userId: string) {
    return doc(collection(this.firestore, 'users'), userId);
  }

}
