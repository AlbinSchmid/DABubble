import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MessengerComponent } from '../messenger/messenger.component';
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
}
