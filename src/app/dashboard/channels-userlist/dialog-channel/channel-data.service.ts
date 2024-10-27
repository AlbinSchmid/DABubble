import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChannelDataService {

  titleSource: string = '';
  descriptionSource: string = '';
  membersSource = signal<any[]>([]);

  constructor() { }
}
