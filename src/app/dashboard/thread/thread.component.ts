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
export class ThreadComponent implements AfterViewInit {
  viewportService = inject(ViewportService)
  reduceInteraktionBtn = true;
  editAnswerMessage = true;
  sourceThread = true;
  @ViewChild('content') scrollContainer: ElementRef;
  parser = inject(MessageParserService);

  @ViewChild('headerName') headerName: ElementRef;
  @ViewChild('messageToReplayName') messageToReplayName: ElementRef;
  isTextWrapped = false;
  isTextWrappedMessage = false;
  resizeObserverHeader!: ResizeObserver;
  resizeObserverMessage!: ResizeObserver;
  checkTextSenderName = false;
  checkTextSenderNameMessage = false;
  windowWith: number;
  windowWithMessage: number;
  headerSenderName: string;
  messageToReplaySenderName: string;


  constructor(public threadService: ThreadService, public firebaseMessenger: FirebaseMessengerService, public messengerService: MessengerService) {
  }


  ngOnInit() {
    this.headerSenderName = this.threadService.messageToReplyTo.senderName;
    this.messageToReplaySenderName = this.threadService.messageToReplyTo.senderName;
  }


  ngAfterViewInit() {  
    this.threadService.scrollContainer = this.scrollContainer;
    this.resizeObserverMessage = new ResizeObserver(() => this.checkTextStatusTest());
    this.resizeObserverHeader = new ResizeObserver(() => this.checkTextStatus());
    this.resizeObserverHeader.observe(this.headerName.nativeElement);
    this.resizeObserverMessage.observe(this.messageToReplayName.nativeElement);
  }


  closeThread() {
    if (this.viewportService.width >= 1550) {
      this.threadService.showThreadSideNav = false; 
      this.messengerService.showDate1Count = false;
    } else if (this.viewportService.width < 1550) {
      this.threadService.showThreadSideNav = false; 
      this.messengerService.showDate1Count = false;
      this.messengerService.openMessenger = true; 
      setTimeout(() => {
        this.messengerService.scrollToBottom(this.messengerService.scrollContainer);
      }, 10);
    } 
  }


  checkTextStatusTest() {
    const element = this.messageToReplayName.nativeElement;
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight || '0');
    const headerNameHeight = element.offsetHeight;

    this.isTextWrappedMessage = headerNameHeight > lineHeight;
    if (this.isTextWrappedMessage && !this.checkTextSenderName) {
      this.windowWithMessage = this.viewportService.width;
      this.checkTextSenderNameMessage = true;
      this.messageToReplaySenderName = `${this.messengerService.getFirstWord(this.threadService.messageToReplyTo.senderName)}. ${this.messengerService.getSecondWordFirstLetter(this.threadService.messageToReplyTo.senderName)}`;
    } else if (this.windowWithMessage < this.viewportService.width) {
      this.messageToReplaySenderName = this.threadService.messageToReplyTo.senderName;
      this.checkTextSenderNameMessage = false;
    }
  }


  checkTextStatus() {
    const element = this.headerName.nativeElement;
    console.log('header');
    
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight || '0');
    const headerNameHeight = element.offsetHeight;
    this.isTextWrapped = headerNameHeight > lineHeight;
    if (this.isTextWrapped && !this.checkTextSenderName) {
      this.windowWith = this.viewportService.width;
      this.checkTextSenderName = true;
      this.headerSenderName = `${this.messengerService.getFirstWord(this.threadService.messageToReplyTo.senderName)}. ${this.messengerService.getSecondWordFirstLetter(this.threadService.messageToReplyTo.senderName)}`;
    } else if (this.windowWith < this.viewportService.width) {
      this.headerSenderName = this.threadService.messageToReplyTo.senderName;
      this.checkTextSenderName = false;
    }
  }


  ngOnDestroy() {
    this.parser.parseMessage(this.firebaseMessenger.content);
    if (this.resizeObserverHeader) {
      this.resizeObserverHeader.disconnect();
    }
    if (this.resizeObserverMessage) {
      this.resizeObserverMessage.disconnect();
    }
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
