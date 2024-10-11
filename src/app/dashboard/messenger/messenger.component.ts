import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DetailPersonComponent } from './detail-person/detail-person.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MessengerService } from '../../shared/services/firebase-services/messenger.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { timestamp } from 'rxjs';
import { EditMessageComponent } from '../../shared/components/message/edit-message/edit-message.component';
import { MessageComponent } from '../../shared/components/message/message.component';
import { ThreadService } from '../../shared/services/thread.service';

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    DetailPersonComponent,
    MatDialogModule,
    EditMessageComponent,
    MessageComponent,
  ],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss'
})
export class MessengerComponent {
  dialog = inject(MatDialog);
  hoveredMessage: number;
  hoveredMenu = false;
  unsubChatList;

  constructor(public firebase: MessengerService, public threadService: ThreadService) {
    this.unsubChatList = firebase.subChatsList(threadService.userId);   
  }

  ngOnDestroy() {
    this.unsubChatList;
  }


  showOrHideMenu() {
    if (this.hoveredMenu == false) {
      this.hoveredMenu = true;
    } else {
      this.hoveredMenu = false;
    }
  }


  openDialog() {
    this.dialog.open(DetailPersonComponent, {
      panelClass: 'my-custom-dialog'
    });
  }
}
