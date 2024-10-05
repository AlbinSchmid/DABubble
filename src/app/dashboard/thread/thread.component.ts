import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MessengerComponent } from '../messenger/messenger.component';
import { MessengerService } from '../../shared/services/firebase-services/messenger.service';
import { ThreadService } from '../../shared/services/thread.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {
  unsubAnswerList;

  constructor(public threadService: ThreadService, public firebase: MessengerService) {
    this.unsubAnswerList = firebase.subAnswersList(threadService.messageId);    
  }

  ngOnDestroy() {
    this.unsubAnswerList;
  }
}
