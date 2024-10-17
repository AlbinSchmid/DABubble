import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../services/messenger-service/messenger.service';
import { ThreadService } from '../../services/thread-service/thread.service';
import { CommonModule } from '@angular/common';
import { Message } from '../../interfaces/message';

@Component({
  selector: 'app-emoji-board',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './emoji-board.component.html',
  styleUrl: './emoji-board.component.scss'
})
export class EmojiBoardComponent {
  @Input() message: Message = {
    content: '',
    isRead: false,
    senderId: '',
    senderName: '',
    senderAvatar: '',
    date: 0,
    type: '',
    id: '',
  }
  @Input() binding: any;
  @Output() callFunction = new EventEmitter<any>();
  normalEmojis: string[] = [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
    '😋', '😎', '😍', '😗', '😙', '🙂', '🤗', '🤔', '😐', '😑',
    '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫',
    '😴', '😌', '😜', '🤤', '😛', '🤑', '😲', '🙃', '😷', '🤒',
    '🤕', '🤧', '😵', '🤯', '😤', '😭', '😢', '😨'
  ];
  workEmojis: string[] = [
    '💼', '📁', '📅', '🖥️', '📊', '📈', '📉', '📝', '💻', '🖱️',
    '📋', '📌', '🖇️', '📄', '✏️', '📤', '📥', '📧', '📞', '📡',
    '🔒', '🔓', '🗑️', '🧾', '📆', '🏢', '🏛️'
  ];
  activeBoard: string = 'normal';
  selectedEmoji: string | null = null;


  constructor(public firebaseMessenger: FirebaseMessengerService, public messengerService: MessengerService, public threadService: ThreadService) {
  }


  /**
   * We select the emoji and put it in the textarea
   * @param emoji - which emoij is choosed
   * @param inputField - the textarea that we put the emoji in
   */
  selectEmoji(emoji: string, inputField: HTMLTextAreaElement): void {
    this.selectedEmoji = emoji;
    const start = inputField.selectionStart ?? 0;
    const end = inputField.selectionEnd ?? 0;
    this.controllWhichBinding(start, emoji, end)
    if (this.binding.name == 'textareaMessenger' || this.binding.name == 'textareaThread') {
      setTimeout(() => {
        inputField.selectionStart = inputField.selectionEnd = start + emoji.length;
        inputField.focus();
      }, 0);
    }
    this.callFunction.emit();
  }


  controllWhichBinding(start: number, emoji: string, end: number) {
    if (this.binding.name == 'textareaMessenger') {
      this.firebaseMessenger.content = this.firebaseMessenger.content.slice(0, start) + emoji + this.firebaseMessenger.content.slice(end);
    } if (this.binding.name == 'textareaThread') {
      this.firebaseMessenger.answerContent = this.firebaseMessenger.answerContent.slice(0, start) + emoji + this.firebaseMessenger.answerContent.slice(end);
    } if (this.binding == this.firebaseMessenger.reaktionContent) {
      this.firebaseMessenger.reaktionContent = '';
      this.firebaseMessenger.reaktionContent = this.firebaseMessenger.reaktionContent.slice(0, start) + emoji + this.firebaseMessenger.reaktionContent.slice(end);
      this.firebaseMessenger.createReaktion(this.message.id);
    } if (this.binding.name == 'textareaEdit') {
      this.messengerService.editMessageContent = this.messengerService.editMessageContent.slice(0, start) + emoji + this.messengerService.editMessageContent.slice(end);
    }
  }


  /**
   * We change the category of the emoijs
   * @param board - which array we use (work or normal)
   */
  switchBoard(board: string): void {
    this.activeBoard = board;
  }
}
