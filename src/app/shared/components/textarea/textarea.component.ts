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
import { MatDialog } from '@angular/material/dialog';
import { FileViewDialogComponent } from '../file-view-dialog/file-view-dialog.component';
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
  messenger:string = 'messenger';
  
  constructor(public firebaseMessenger: FirebaseMessengerService, public messengerService: MessengerService, public threadService: ThreadService, private dialog:MatDialog) {
    this.storage = inject(Storage);
  }


  chatOrChannelTxt() {
    if (this.messengerService.openChart) {
      return `Schreibe eine Nachricht an ${this.messengerService.user.username}`
    } else {
      return `Nachricht an #${this.messengerService.channel.title}`
    }
    
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
    const dialogRef = this.dialog.open(FileViewDialogComponent, {
      width: '80%',
      height: '80%',
      data: { file: file } 
    });

    dialogRef.afterClosed().subscribe(result => { 
      this.selectedFileToView = null;
    });
  }


  async uploadFiles(messenger: any) {
    // Determine initial content based on the type of messenger
    let originalContent = messenger === 'messenger'
        ? this.firebaseMessenger.content
        : this.firebaseMessenger.answerContent;

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

            // Append file link with different formatting based on file type
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                originalContent += `\n\n<a href="${url}" target="_blank"><img src="${url}" alt="${file.name}" width="48px" height="48px"/> </a>`;
            } else {
                originalContent += `\n\n<a href="${url}" target="_blank"><img width="48px" height="48px" src="assets/icons/pdf.webp" alt="${file.name}"></a>`;
            }  
        } catch (error) {
            console.error('Upload error for file: ', file.name, error);
        }
    }

    // Update the appropriate content field and send the message
    if (messenger === 'messenger') {
        this.firebaseMessenger.content = originalContent;
        this.firebaseMessenger.createMessage('');
    } else {
        this.firebaseMessenger.answerContent = originalContent;
        this.firebaseMessenger.createAnswer(this.threadService.messageId);
        console.log("Answer content updated:", this.firebaseMessenger.answerContent);
    }

    this.selectedFiles = [];
}
  
  deletePreviewFile(file: any) {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
  }

}
