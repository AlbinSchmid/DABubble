import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseMessengerService } from '../../shared/services/firebase-services/firebase-messenger.service';
import { ThreadService } from '../../shared/services/thread-service/thread.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from '../../shared/components/message/message.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MessageComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {
  unsubAnswerList;
  reduceInteraktionBtn = true;


  constructor(public threadService: ThreadService, public firebaseMessenger: FirebaseMessengerService) {
    this.unsubAnswerList = firebaseMessenger.subAnswersList();   
  }
  

  ngOnDestroy() {
    this.unsubAnswerList;
  }


  /**
   * controlls how many answered message are under the main message
   * @returns - the number of answered messages
   */
  checkAnswerArrayLength() {
    if (this.firebaseMessenger.answers.length > 1) {
      return `${this.firebaseMessenger.answers.length} Antworten`;
    } else if (this.firebaseMessenger.answers.length == 0) {
      return `Keine Antworten`;
    } else {
      return `${this.firebaseMessenger.answers.length} Antwort`;
    }
  }
}
