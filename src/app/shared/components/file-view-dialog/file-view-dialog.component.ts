import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-file-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './file-view-dialog.component.html',
  styleUrls: ['./file-view-dialog.component.scss']
})
export class FileViewDialogComponent {

  data = inject(MAT_DIALOG_DATA);
  
  constructor( public dialogRef: MatDialogRef<FileViewDialogComponent>, private sanitizer: DomSanitizer) {}

  closeDialog() {
    this.dialogRef.close();
    console.log(this.data);
    
  }

  get safePdfUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.data.file.data);
  }
}


