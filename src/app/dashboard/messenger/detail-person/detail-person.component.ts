import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-detail-person',
  standalone: true,
  imports: [
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule
  ],
  templateUrl: './detail-person.component.html',
  styleUrl: './detail-person.component.scss'
})
export class DetailPersonComponent {
  readonly dialogRef = inject(MatDialogRef<DetailPersonComponent>);

  closeDialog() {
    this.dialogRef.close();
  }

}
