import { Component, EventEmitter, inject, Input, input, OnInit, Output } from '@angular/core';
import { AuthserviceService } from '../services/authservice.service';
import { UserInterface } from '../interfaces/userinterface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing-test-user-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing-test-user-dialog.component.html',
  styleUrls: ['./landing-test-user-dialog.component.scss']
})
export class LandingTestUserDialogComponent implements OnInit {
  authService = inject(AuthserviceService);
  avatarUrl: string | undefined;

  ngOnInit(): void {
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        const newUser: UserInterface = {
          userID: user.uid,
          password: '',
          email: user.email,
          username: user.displayName,
          avatar: user.photoURL
        };

        this.authService.currentUserSig.set(newUser);
        this.avatarUrl = newUser.avatar; 

        console.log('Current User Signature:', this.authService.currentUserSig());
        console.log('Avatar URL:', this.avatarUrl);
      } else {
        this.authService.setCurrentUser(null);
      }
    });
  }
  onImageError() {
    console.error('Image failed to load. Current Avatar URL:', this.avatarUrl);
    this.avatarUrl = 'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a'; 
  }


  //emoji board

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
  message: string = ''; 
  selectedEmoji: string | null = null;

  @Output() emojiSelected = new EventEmitter<string>();

  
  selectEmoji(emoji: string, inputField: HTMLTextAreaElement): void {
    this.selectedEmoji = emoji;
    
    const start = inputField.selectionStart ?? 0;
    const end = inputField.selectionEnd ?? 0;

    this.message = this.message.slice(0, start) + emoji + this.message.slice(end);
    
    
    setTimeout(() => {
      inputField.selectionStart = inputField.selectionEnd = start + emoji.length;
      inputField.focus();
    }, 0);
  }

  switchBoard(board: string): void {
    this.activeBoard = board;
  }
}


