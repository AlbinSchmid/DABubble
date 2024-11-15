import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [
    CommonModule,
    TextareaComponent,
    MatInputModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {

  sourceThread = false;

  constructor() { }

}
