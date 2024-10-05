import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MessengerComponent } from '../messenger/messenger.component';
import { DataService } from '../../shared/services/data.service';
import { MessengerService } from '../../shared/firebase-services/messenger.service';

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

  constructor(public dataService: DataService, public firebase: MessengerService) {
    this.unsubAnswerList = firebase.subAnswersList(dataService.messageId);    
  }

  ngOnDestroy() {
    this.unsubAnswerList;
  }
}
