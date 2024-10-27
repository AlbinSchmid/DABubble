import { Injectable, signal } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';

@Injectable({
  providedIn: 'root'
})
export class ChannelDataService {

  titleSource: string = '';
  descriptionSource: string = '';
  membersSource = signal<any[]>([]);

  constructor() { }
}
