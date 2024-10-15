import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../services/messenger-service/messenger.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThreadService } from '../../services/thread-service/thread.service';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss'
})
export class TextareaComponent {
  @Output() emojiSelected = new EventEmitter<string>();
  @Input() messengerOrThread: any;
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
  showEmoijs = false;


  constructor(public firebaseMessenger: FirebaseMessengerService, public messengerService: MessengerService, public threadService: ThreadService) { }


  /**
   * We select the emoji and put it in the textarea
   * @param emoji - which emoij is choosed
   * @param inputField - the textarea that we put the emoji in
   */
  selectEmoji(emoji: string, inputField: HTMLTextAreaElement): void {
    this.selectedEmoji = emoji;
    const start = inputField.selectionStart ?? 0;
    const end = inputField.selectionEnd ?? 0;
    if (this.messengerOrThread == 'messenger') {
      this.firebaseMessenger.content = this.firebaseMessenger.content.slice(0, start) + emoji + this.firebaseMessenger.content.slice(end);
    } else {
      this.firebaseMessenger.answerContent = this.firebaseMessenger.answerContent.slice(0, start) + emoji + this.firebaseMessenger.answerContent.slice(end);
    }
    setTimeout(() => {
      inputField.selectionStart = inputField.selectionEnd = start + emoji.length;
      inputField.focus();
    }, 0);
  }


  /**
   * We change the category of the emoijs
   * @param board - which array we use (work or normal)
   */
  switchBoard(board: string): void {
    this.activeBoard = board;
  }


  /**
   * Open or close the emoji board.
   */
  openEmoijs() {
    if (this.showEmoijs == false) {
      this.showEmoijs = true;
    } else {
      this.showEmoijs = false;
    }
  }
}
