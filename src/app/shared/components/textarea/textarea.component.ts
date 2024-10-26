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
  authService = inject(AuthserviceService);
  date = new Date();
  messenger: string = 'messenger';
  selectedFileToView: any;
  constructor(public firebaseMessenger: FirebaseMessengerService, public messengerService: MessengerService, public threadService: ThreadService, private dialog: MatDialog, private storage: Storage) {
  }


  /**
   * Return the text to show in the text area, depending on the user's location.
   * If the user is in a channel, return "Nachricht an #<channel name>".
   * If the user is in a private chat, return "Schreibe eine Nachricht an <username>".
   */
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

  /**
   * Scroll the div down by emitting an event.
   */
  scrollDivDown() {
    this.scrollDown.emit();
  }

  /**
   * Handles the selection of files from an input event.
   * Reads the selected files and adds them to the `selectedFiles` array
   * as objects containing the file name, type, data URL, and raw file.
   * 
   * @param event - The file input change event containing the selected files.
   */
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

  /**
   * Opens a dialog with a preview of the given file.
   * 
   * @param file - The file to preview.
   */
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

  /**
   * Asynchronously uploads all selected files to Firebase Storage, updates the message content 
   * with file URLs, and clears the list of selected files.
   * 
   * @param messenger - A string indicating the type of messenger ('messenger' or 'thread') 
   *                    to determine the initial content to be updated.
   */
  async uploadFiles(messenger: any) {
    let originalContent = this.getInitialContent(messenger);
    const folderName = `uploads/${this.messengerService.user.userID}/`;
    for (const file of this.selectedFiles) {
      try {
        const url = await this.uploadFileToStorage(folderName, file);
        originalContent = this.appendFileToContent(originalContent, url, file);
      } catch (error) {
        console.error('Upload error for file: ', file.name, error);
      }
    }
    this.updateContent(messenger, originalContent);
    this.selectedFiles = [];
  }

  /**
   * Retrieves the initial content based on the type of messenger.
   * 
   * @param messenger - A string indicating the type of messenger ('messenger' or 'thread').
   * @returns The initial content corresponding to the provided messenger type.
   */
  private getInitialContent(messenger: any): string {
    return messenger === 'messenger' ? this.firebaseMessenger.content : this.firebaseMessenger.answerContent;
  }

  /**
   * Uploads a file to Firebase Storage and returns the download URL.
   * The file is uploaded to the folder determined by the provided folderName
   * parameter. The file name is appended to the folder name to form the full
   * path in Storage.
   */
  private async uploadFileToStorage(folderName: string, file: any): Promise<string> {
    const filePath = `${folderName}${file.name}`;
    const fileRef = ref(this.storage, filePath);
    const rawFile = file.rawFile;
    const snapshot = await uploadBytes(fileRef, rawFile);
    return await getDownloadURL(snapshot.ref);
  }

  /**
   * Appends an image or file link to the given content based on the file type.
   */
  private appendFileToContent(originalContent: string, url: string, file: any): string {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const imgTag = this.getImageTag(url, file.name, fileExtension);
    return `${originalContent}\n\n${imgTag}`;
  }

  /**
   * Generates an HTML image tag or link for a file based on its extension.
   */
  private getImageTag(url: string, fileName: string, fileExtension: string): string {
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return `<a href="${url}" target="_blank"><img src="${url}" alt="${fileName}" width="48px" height="48px"/> </a>`;
    } else {
      return `<a href="${url}" target="_blank"><img width="48px" height="48px" src="assets/icons/pdf.webp" alt="${fileName}"></a>`;
    }
  }

  /**
   * Updates the content of the messenger or thread based on the provided messenger type.
   * If the messenger type is 'messenger', the content is updated in the messenger and
   * a message is created. If the messenger type is 'thread', the answer content is updated
   * and an answer is created for the message with the ID determined by the threadService.
   */
  private updateContent(messenger: any, originalContent: string) {
    if (messenger === 'messenger') {
      this.firebaseMessenger.content = originalContent;
      this.firebaseMessenger.createMessage('');
    } else {
      this.firebaseMessenger.answerContent = originalContent;
      this.firebaseMessenger.createAnswer(this.threadService.messageId);
    }
  }

  /**
   * Removes a file from the selected files array and UI.
   */
  deletePreviewFile(file: any) {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
  }

}
