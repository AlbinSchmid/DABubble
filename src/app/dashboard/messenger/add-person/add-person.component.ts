import { Component, EventEmitter, Inject, inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MentionUserInterface } from '../../../shared/interfaces/mention-user-interface';
import { MatIconModule } from '@angular/material/icon';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DetailPersonComponent } from '../detail-person/detail-person.component';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { AddMembersComponent } from '../../channels-userlist/dialog-channel/add-members/add-members.component';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';

@Component({
  selector: 'app-add-person',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './add-person.component.html',
  styleUrl: './add-person.component.scss'
})
export class AddPersonComponent {
  messengerService = inject(MessengerService);
  authService = inject(AuthserviceService);
  dialog = inject(MatDialog);

  @Input() users: UserInterface[] = [];
  @Input() addPersonView: boolean = false;
  @Output() closeOverlay = new EventEmitter<void>();


  checkText() {
    console.log(this.addPersonView);
    
    return this.addPersonView ? 'Leute hinzufügen' : 'Mitglieder';
  }
  

  closeDialog() {
    this.closeOverlay.emit();
  }


  openDialogDetailPerson(user: any) {    
    this.dialog.open(DetailPersonComponent, {
      data: user,
    });
  }
}
