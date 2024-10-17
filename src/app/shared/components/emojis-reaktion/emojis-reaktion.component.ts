import { Component, Input } from '@angular/core';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../services/messenger-service/messenger.service';

@Component({
  selector: 'app-emojis-reaktion',
  standalone: true,
  imports: [],
  templateUrl: './emojis-reaktion.component.html',
  styleUrl: './emojis-reaktion.component.scss'
})
export class EmojisReaktionComponent {
  @Input() messageID: string;
  // unsubReaktionList: any;

  constructor(public firebaseMessenger: FirebaseMessengerService, private messengerService: MessengerService) {
    console.log('array from reactions', firebaseMessenger.reactions);
    
    // setTimeout(() => {
    //   console.log(messengerService.messageId);
      
    //   this.unsubReaktionList = firebaseMessenger.subReactionList();
    //   console.log(firebaseMessenger.reactions);
      
    // },);
  }

  controllReaction(reaction: any) {
    console.log('reaction is', reaction);
    
  }

  // ngOnDestroy() {
  //   this.unsubReaktionList;
  // }

}
