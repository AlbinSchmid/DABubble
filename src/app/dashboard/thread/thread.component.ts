import { AfterViewInit, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseMessengerService } from '../../shared/services/firebase-services/firebase-messenger.service';
import { ThreadService } from '../../shared/services/thread-service/thread.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from '../../shared/components/message/message.component';
import { MessengerService } from '../../shared/services/messenger-service/messenger.service';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import { MessageParserService } from '../../shared/services/message-parser.service';
import { ViewportService } from '../../shared/services/viewport.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MessageComponent,
    TextareaComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent implements AfterViewInit{
  viewportService = inject(ViewportService)
  reduceInteraktionBtn = true;
  editAnswerMessage = true;
  sourceThread = true;
  @ViewChild('content') scrollContainer: ElementRef;
  parser = inject(MessageParserService);


  constructor(public threadService: ThreadService, public firebaseMessenger: FirebaseMessengerService, public messengerService: MessengerService) {
  }
  
  
  ngAfterViewInit() {
      this.threadService.scrollContainer = this.scrollContainer;
  }


  ngOnDestroy() {
    this.parser.parseMessage(this.firebaseMessenger.content);
  }


  getParsedMessage(message: string) {
    if (this.editAnswerMessage) {
      return message;
    }
    return this.parser.parseMessage(this.firebaseMessenger.answerContent);
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
