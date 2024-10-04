import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DetailPersonComponent } from './detail-person/detail-person.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MessengerService } from '../../shared/firebase-services/messenger.service';
import { Message } from '../../shared/interfaces/message';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { timestamp } from 'rxjs';

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
  ],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss'
})
export class MessengerComponent {
  dialog = inject(MatDialog);
  hoveredMessage: number;
  hoveredMenu = false;

  constructor(public firebase: MessengerService) {

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
