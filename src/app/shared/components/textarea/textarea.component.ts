import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
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
import { MatMenuModule } from '@angular/material/menu';
import { FirestoreService } from '../../services/firebase-services/firestore.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { collection, doc, onSnapshot } from '@firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { user } from '@angular/fire/auth';
import { MentionUserInterface } from '../../interfaces/mention-user-interface';
import { Message } from '../../../models/message.class';
import { MentionModule } from 'angular-mentions';
import { Subscription } from 'rxjs';
import { ViewportService } from '../../services/viewport.service';
@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmojiBoardComponent,
    MatIcon,
    MatMenuModule,
    MentionModule,
  ],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  providers: []
})
export class TextareaComponent {
  viewportService = inject(ViewportService);
  authService = inject(AuthserviceService);
  firestoreService: FirestoreService = inject(FirestoreService);
  firestore: Firestore = inject(Firestore);
  firebaseMessenger: FirebaseMessengerService = inject(FirebaseMessengerService);
  messengerService: MessengerService = inject(MessengerService);
  threadService: ThreadService = inject(ThreadService);
  dialog = inject(MatDialog);
  storage = inject(Storage);

  @Input() sourceThread: boolean;

  @ViewChild('textareaMessenger') textareaMessenger!: ElementRef;
  @ViewChild('textareaThread') textareaThread!: ElementRef;
  @ViewChild('mentionPersonDiv') mentionPersonDiv!: ElementRef;

  usersListAll: UserInterface[] = [];
  usersToMention: MentionUserInterface[] = [];
  filteredUsersToMention: MentionUserInterface[] = [];
  selectedFiles: any[] = [];

  selectedFile: File;
  mentionPersonBtnSrc: string;
  subscription!: Subscription;

  selectedFileToView: any;
  userListSubscription: any;
  unsubChannelList: any;
  unsubAnswerList: any;

  date = new Date();

  mentionPersonView = false;
  mentionPersonViewFromBtn = false;
  showEmojiBoard = false;
  textareaFocus = false;
  mentionActive = false;
  laodMentionUsers = true;

  messenger = 'messenger';

  mentionConfig = {
    labelKey: 'userName',
    items: [] as MentionUserInterface[],
    mentionChar: "@",
    mentionDialogOpened: false,
  }


  /**
   * Lifecycle hook that is called after data-bound properties
   * of a directive are initialized. Subscribes to the textareas
   * of the messenger and thread, and sets the focus to the
   * respective textarea if it exists. Also subscribes to the
   * list of all users and saves it to the usersListAll property.
   */
  ngOnInit(): void {
    this.subscription = this.messengerService.textareaMessenger.subscribe(() => {
      if (this.textareaMessenger) {
        this.textareaMessenger.nativeElement.focus();
      }
    });
    this.subscription = this.messengerService.textareaThread.subscribe(() => {
      if (this.textareaThread) {
        this.textareaThread.nativeElement.focus();
      }
    });
    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      this.usersListAll = users;
    });
  }


  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Unsubscribes from the subscription of the messenger service and
   * the subscription of the channel list. This is necessary to prevent
   * memory leaks.
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.unsubChannelList;
  }


  /**
   * Handles the enter key press event on the textarea.
   * Prevents the default behavior of the enter key and uploads files if the textarea is valid
   * or if there are files selected.
   * 
   * @param event - The keyboard event triggered by pressing the enter key.
   * @param messenger - A string indicating the type of messenger ('messenger' or 'thread').
   * @param textarea - The textarea element being interacted with, used to check validity.
   */
  confirmedWithEnter(event: any, messenger: string, textarea: any): void {
    event.preventDefault();
    if (textarea.valid || this.selectedFiles.length > 0) {
      this.uploadFiles(messenger);
    }
  }


  /**
   * Checks for the presence of a mention trigger in the input content and updates
   * the mention view state accordingly. If a mention trigger is detected, it
   * initiates the process to check if a full mention was typed. If the mention
   * trigger is followed by a space, it closes the mention view.
   * 
   * @param content - The content of the input field to be checked for mention triggers.
   */
  checkForMention(content: any): void {
    this.mentionPersonBtnSrc = '';
    this.mentionPersonViewFromBtn = false;
    const inputContent = content;
    const mentionIndex = inputContent.lastIndexOf('@');
    if (this.messengerService.openChannel) {
      if (/\B@\w*$/.test(inputContent)) {
        this.checkIfMentionWasTyped(mentionIndex, inputContent);
      } else if (/\B@\w*\s$/.test(inputContent)) {
        this.mentionPersonView = false;
      } else {
        this.mentionPersonView = false;
      }
    }
  }


  /**
   * Tests if a mention was typed and if the user wants to open the list of users to mention.
   * If a mention was typed, it filters the list of users that the user can mention and
   * opens the list of users to mention. If no mention was typed, it closes the list of
   * users to mention.
   * @param mentionIndex - The index of the mention in the input content.
   * @param inputContent - The content of the input field.
   */
  checkIfMentionWasTyped(mentionIndex: number, inputContent: any): void {
    if (this.laodMentionUsers) {
      this.subChannelList();
      this.laodMentionUsers = false;
    }
    if (mentionIndex !== -1) {
      this.mentionPersonView = true;
      const searchText = inputContent.substring(mentionIndex + 1);
      this.mentionConfig.items = this.usersToMention.filter(user =>
        user.userName.toLowerCase().startsWith(searchText.toLowerCase())
      );
    } else {
      this.mentionPersonView = false;
    }
  }


  /**
   * Subscribes to the list of users in the channel with the given ID.
   * When there is a change in the list, it will update the usersToMention array and
   * the items of the mentionConfig.
   * @returns An unsubscribe function that can be used to stop listening to the list of users.
   */
  subChannelList(): any {
    const messegeRef = doc(collection(this.firestore, `channels`), this.messengerService.channel.channelID);
    return onSnapshot(messegeRef, (list) => {
      if (list.exists()) {
        this.usersToMention = [];
        this.mentionConfig.items = [];
        const usersIDs = list.data()['userIDs'];
        this.everyUserGetPushedInArray(usersIDs);
        this.messengerService.sortByName(this.usersToMention);
        this.usersToMention.forEach((user) => {
          this.mentionConfig.items.push(user);
        });
      } else {
        console.error("doc is empty or doesn't exist");
      }
    })
  }


  /**
   * Pushes all users from the given usersIDs array in the this.usersToMention array.
   * The current user is filtered out from the list. The function is called when the
   * channelList (users in the channel) changes.
   * @param {string[]} usersIDs - Array of all user IDs in the channel.
   */
  everyUserGetPushedInArray(usersIDs: string[]): void {
    for (let i = 0; i < usersIDs.length; i++) {
      const userID = usersIDs[i];
      const user = this.usersListAll.filter(user => user.userID === userID);
      this.usersToMention.push(this.getCleanJson(user));
      this.usersToMention = this.usersToMention.filter(user => user.userID !== this.authService.currentUserSig()?.userID);
    }
  }


  /**
   * Generates a clean JSON representation of the user data.
   * 
   * This function takes an array of `UserInterface` objects and constructs
   * a simplified JSON object containing the user's avatar, userID, and userName.
   * If the avatar is not present, a default avatar URL is used.
   * 
   * @param user - An array of `UserInterface` objects from which the first element's 
   *               data is used to construct the JSON object.
   * @returns A JSON object with the user's avatar, userID, and userName.
   */
  getCleanJson(user: UserInterface[]): any {
    let userJson = {
      avatar: user[0]['avatar'] || 'https:firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a',
      userID: user[0]['userID'],
      userName: user[0]['username'],
    }
    return userJson;
  }


  /**
   * Opens or closes the mention person view based on the given source.
   * If the view is already open, it closes the view and sets the
   * mentionPersonViewFromBtn variable to false. If the view is closed,
   * it opens the view and sets mentionPersonViewFromBtn to true.
   * The mentionPersonBtnSrc variable is set to the given source string.
   * @param {string} src - The source of the mention person view (either 'messenger'
   *                       or 'thread').
   */
  openOrCloseMentionPersonView(src: string): void {
    this.mentionPersonBtnSrc = src;
    this.subChannelList();
    if (this.mentionPersonView) {
      this.mentionPersonView = false;
      this.mentionPersonViewFromBtn = false;
      this.mentionPersonBtnSrc = '';
    } else {
      this.mentionPersonView = true;
      this.mentionPersonViewFromBtn = true;
    }
  }


  /**
   * Adds a mention in the form of `@userName` to the textarea content or the answer content of the
   * textarea component. If the mention person view was opened from a button, it calls
   * `ceckIfMessengerOrThreadWithBtn` to determine if the mention is added to the textarea content or
   * the answer content. If the mention person view was opened from a keypress, it adds the mention to
   * the content of the textarea component that triggered the mention person view.
   * @param {any} userJson - A JSON object containing the avatar, userID, and userName of the user to be
   *                        mentioned.
   * @param {string} src - The source of the mention person view (either 'messenger' or 'thread').
   */
  mentionUser(userJson: any, src: string): void {
    const mentionText = `@${userJson.userName}`;
    if (this.mentionPersonViewFromBtn) {
      this.ceckIfMessengerOrThreadWithBtn(mentionText);
    } else {
      if (src === 'messenger') {
        const mentionIndex = this.firebaseMessenger.content.lastIndexOf('@');
        this.firebaseMessenger.content = this.firebaseMessenger.content.substring(0, mentionIndex) + mentionText;
      } else {
        const mentionIndex = this.firebaseMessenger.answerContent.lastIndexOf('@');
        this.firebaseMessenger.answerContent = this.firebaseMessenger.answerContent.substring(0, mentionIndex) + mentionText;
      }
    }
    this.mentionPersonView = false;
  }

  
  /**
   * Adds a mention in the form of `@userName` to the textarea content or the answer content of the
   * textarea component, depending on the source of the mention person view.
   * If the mention person view was opened from the messenger button, the mention is added to the
   * textarea content. If the mention person view was opened from the thread button, the mention is
   * added to the answer content.
   * @param {string} mentionText - The mention text to be added, in the form of `@userName`.
   */
  ceckIfMessengerOrThreadWithBtn(mentionText: string): void {
    if (this.mentionPersonBtnSrc === 'messenger') {
      this.firebaseMessenger.content = this.firebaseMessenger.content + mentionText;
    } else if (this.mentionPersonBtnSrc === 'thread') {
      this.firebaseMessenger.answerContent = this.firebaseMessenger.answerContent + mentionText;
    }
  }


  /**
   * Return the text to show in the text area, depending on the user's location.
   * If the user is in a channel, return "Nachricht an #<channel name>".
   * If the user is in a private chat, return "Schreibe eine Nachricht an <username>".
   */
  chatOrChannelTxt(): string {
    if (this.messengerService.openChart) {
      return `Schreibe eine Nachricht an ${this.messengerService.user.username}`
    } else {
      return `Nachricht an #${this.messengerService.channel.title}`
    }
  }


  /**
   * Open or close the emoji board.
  */
  openOrCloseEmojiBoard(): void {
    this.showEmojiBoard = !this.showEmojiBoard;
  }


  /**
   * Handles the selection of files from an input event.
   * Reads the selected files and adds them to the `selectedFiles` array
   * as objects containing the file name, type, data URL, and raw file.
   * 
   * @param event - The file input change event containing the selected files.
   */
  onFileSelected(event: any): void {
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
  viewFile(file: any): void {
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
  async uploadFiles(messenger: any): Promise<void> {
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
    this.ngOnInit();
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
  private updateContent(messenger: any, originalContent: string): void {
    if (messenger === 'messenger') {
      this.firebaseMessenger.content = originalContent;
      let text = this.firebaseMessenger.content;
      if (this.messengerService.selectUserNewMessage.length > 0 || this.messengerService.selectChannelsNewMessage.length > 0) {
        this.checkIfSelectedUsers(text);
        this.checkIfSelectedChannels(text);
      } else {
        this.createMessageAndScrollToBottom();
      }
    } else {
      this.createAnswerMessage(originalContent);
    }
  }


  /**
   * Creates a message in the messenger using the current content and scrolls to the
   * bottom of the messenger scroll container after a delay of 10 milliseconds.
   */
  createMessageAndScrollToBottom(): void {
    this.firebaseMessenger.createMessage('noID', 'noCollection', false);
    setTimeout(() => {
      this.messengerService.scrollToBottom(this.messengerService.scrollContainer);
    }, 10);
  }


  /**
   * Creates an answer message for the message with the ID stored in the thread service
   * using the provided content and updates the answer content of the firebase messenger.
   * Scrolls to the bottom of the thread scroll container after a delay of 10 milliseconds.
   * @param originalContent - the content of the answer message
   */
  createAnswerMessage(originalContent: string): void {
    this.firebaseMessenger.answerContent = originalContent;
    this.firebaseMessenger.createMessage(this.threadService.messageToReplyTo.messageID, 'answer', false);
    setTimeout(() => {
      this.messengerService.scrollToBottom(this.threadService.scrollContainer);
    }, 10);
  }


  /**
   * If there are selected users in the messenger service, this function loops through
   * the selected users and creates a message in the chart of each user using the
   * provided content.
   * @param text - the content of the message to be created
   */
  checkIfSelectedUsers(text: string): void {
    if (this.messengerService.selectUserNewMessage.length > 0) {
      for (let i = 0; i < this.messengerService.selectUserNewMessage.length; i++) {
        let user = this.messengerService.selectUserNewMessage[i];
        this.firebaseMessenger.searchChat(user, true, (chartID: string) => {
          let chartOrChannel = 'chart';
          this.firebaseMessenger.content = text;
          this.firebaseMessenger.createMessage('noID', 'noCollection', false, chartID, chartOrChannel);
        });
        if (i === this.messengerService.selectUserNewMessage.length - 1) {
          setTimeout(() => {
            this.messengerService.selectUserNewMessage = [];
          }, 10);
        }
      }
    }
  }

  
  /**
   * If there are selected channels in the messenger service, this function loops through
   * the selected channels and creates a message in each channel using the provided content.
   * @param text - the content of the message to be created
   */
  checkIfSelectedChannels(text: string): void {
    if (this.messengerService.selectChannelsNewMessage.length > 0) {
      for (let i = 0; i < this.messengerService.selectChannelsNewMessage.length; i++) {
        let channel = this.messengerService.selectChannelsNewMessage[i];
        this.firebaseMessenger.searchChannel(channel, (chartID: string) => {
          let chartOrChannel = 'channel';
          this.firebaseMessenger.content = text;
          this.firebaseMessenger.createMessage('noID', 'noCollection', false, chartID, chartOrChannel = 'channel');
        });
        if (i === this.messengerService.selectChannelsNewMessage.length - 1) {
          setTimeout(() => {
            this.messengerService.selectChannelsNewMessage = [];
          }, 10);
        }
      }
    }
  }

  
  /**
   * Removes a file from the selected files array and UI.
   */
  deletePreviewFile(file: any): void {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
  }

}
