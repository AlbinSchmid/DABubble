import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { UserInterface } from '../../../../landing-page/interfaces/userinterface';
import { MembersSourceService } from '../../../../shared/services/members-source.service';

@Component({
  selector: 'app-filtered-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './filtered-list.component.html',
  styleUrl: './filtered-list.component.scss'
})
export class FilteredListComponent {
  @Input() filteredUsers: UserInterface[] = [];
  @Input() highlightedIndex: number = -1;
  @Output() userSelected = new EventEmitter<UserInterface>();

  memberSourceService: MembersSourceService = inject(MembersSourceService);

  addUser(user: UserInterface) {
    this.userSelected.emit(user);
  }
}
