import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-title-description',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    MatCardModule,
  ],
  templateUrl: './title-description.component.html',
  styleUrl: './title-description.component.scss'
})
export class TitleDescriptionComponent {

  title: string = '';
  @Output() titleChanged = new EventEmitter<string>();

  description: string;
  @Output() descriptionChanged = new EventEmitter<string>();

  constructor() {
    this.title = '';
    this.description = '';
  }

  onTitleChange() {
    this.titleChanged.emit(this.title);
  }

  onDescriptionChange() {
    this.titleChanged.emit(this.title);
  }
}
