import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UserInterface } from '../../../../../landing-page/interfaces/userinterface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ChannelDataService } from '../../channel-data.service';

@Component({
  selector: 'app-filtred-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './filtred-list.component.html',
  styleUrls: ['./filtred-list.component.scss']
})
export class FiltredListComponent {
  @Input() filteredUsers: UserInterface[] = [];
  @Input() highlightedIndex: number = -1;
  @Output() userSelected = new EventEmitter<UserInterface>();

  channelDataService: ChannelDataService = inject(ChannelDataService);

  addUser(user: UserInterface) {
    this.userSelected.emit(user);
  }
}
