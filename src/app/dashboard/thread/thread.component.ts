import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MessengerService } from '../../shared/services/firebase-services/messenger.service';
import { ThreadService } from '../../shared/services/thread.service';
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


  constructor(public threadService: ThreadService, public firebase: MessengerService) {
    this.unsubAnswerList = firebase.subAnswersList(threadService.messageId);   
  }
  

  ngOnDestroy() {
    this.unsubAnswerList;
  }


  /**
   * controlls how many answered message are under the main message
   * @returns - the number of answered messages
   */
  checkAnswerArrayLength() {
    if (this.firebase.answers.length > 1) {
      return `${this.firebase.answers.length} Antworten`;
    } else {
      return `${this.firebase.answers.length} Antwort`;
    }
  }
}
