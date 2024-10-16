import { Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {
  showMessenger = false;
  userId: string;
  chartId = '';
  messageId = '';
  user: UserInterface = {
    userID: '',
    password: '',
    email: '',
    username: '',
    avatar: '',
    userStatus: '',
    isFocus: false,
  }

  constructor() { }
}
