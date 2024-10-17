import { Component, Input } from '@angular/core';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';

@Component({
  selector: 'app-emojis-reaktion',
  standalone: true,
  imports: [],
  templateUrl: './emojis-reaktion.component.html',
  styleUrl: './emojis-reaktion.component.scss'
})
export class EmojisReaktionComponent {
  @Input() messageID: string;


  constructor(public firebaseMessenger: FirebaseMessengerService) {
  }


}
