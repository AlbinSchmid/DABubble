import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../services/messenger-service/messenger.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThreadService } from '../../services/thread-service/thread.service';
import { EmojiBoardComponent } from '../emoji-board/emoji-board.component';
import { MatIcon } from '@angular/material/icon';
import { provideStorage, getStorage, Storage } from '@angular/fire/storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmojiBoardComponent,
    MatIcon,
  ],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  providers: []
})
export class TextareaComponent {
  @Input() sourceThread: boolean;
  @Output() scrollDown = new EventEmitter<any>();
  showEmojiBoard = false;
  selectedFile: File;
  selectedFiles: any[] = [];
  storage: Storage;
  authService = inject(AuthserviceService);
  date= new Date();
  constructor(public firebaseMessenger: FirebaseMessengerService, public messengerService: MessengerService, public threadService: ThreadService) {
    this.storage = inject(Storage);
  }
  
  /**
   * Open or close the emoji board.
  */
 openOrCloseEmojiBoard() {
    this.showEmojiBoard = !this.showEmojiBoard;
  }

  scrollDivDown() {
    this.scrollDown.emit();
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({ name: file.name, type: file.type, data: e.target.result, rawFile: file });
      };
      reader.readAsDataURL(file);
    }
  }

  selectedFileToView: any;

  viewFile(file: any) {
    this.selectedFileToView = file;
  }

  closeModal() {
    this.selectedFileToView = null;
  }

  async uploadFiles() {
    let originalContent = this.firebaseMessenger.content
    console.log('Starting uploadFiles function');
    const folderName = `uploads/${this.messengerService.user.userID}/`;
    console.log(`Generated folder name: ${folderName}`);
    
    for (const file of this.selectedFiles) {
        const filePath = `${folderName}${file.name}`;
        console.log(`Uploading file: ${file.name} to path: ${filePath}`);
        const fileRef = ref(this.storage, filePath);
        const rawFile = file.rawFile;
        try {
            const snapshot = await uploadBytes(fileRef, rawFile);
            console.log(`Upload success for file: ${file.name}`);
            const url = await getDownloadURL(snapshot.ref);
            console.log('File URL: ', url);
            originalContent += `\n\n<img src="${url}" alt="${file.name}" style="max-width: 200px;"/>`;
            this.firebaseMessenger.content = originalContent;
        } catch (error) {
            console.error('Upload error for file: ', file.name, error);
        }
    }
    this.firebaseMessenger.createMessage('')
    this.selectedFiles = [];
  }
  



}
