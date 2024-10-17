import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../services/messenger-service/messenger.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThreadService } from '../../services/thread-service/thread.service';
import { EmojiBoardComponent } from '../emoji-board/emoji-board.component';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmojiBoardComponent,
  ],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss'
})
export class TextareaComponent {
  @Input() sourceThread: boolean;
  showEmojiBoard = false;


  constructor(public firebaseMessenger: FirebaseMessengerService, public messengerService: MessengerService, public threadService: ThreadService) { }
  
  
  /**
   * Open or close the emoji board.
  */
 openOrCloseEmojiBoard() {
    console.log(this.showEmojiBoard);
    if (this.showEmojiBoard == false) {
      this.showEmojiBoard = true;
    } else {
      this.showEmojiBoard = false;
    }
  }
}
