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

  /**
   * Closes the dialog.
   */
  closeDialog() {
    this.dialogRef.close();
  }

  /**
   * A getter that bypasses the security trust of the sanitizer and returns a ResourceURL that can be used
   * to display a PDF file in an iframe. This is necessary because the PDF file is stored in the Cloud Storage
   * and the URL is not trusted by the sanitizer.
   */
  get safePdfUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.data.file.data);
  }
}


