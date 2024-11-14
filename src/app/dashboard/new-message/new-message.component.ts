import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [
    CommonModule,
    TextareaComponent,
    MatInputModule
  ],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {

  sourceThread = false;

  constructor() { }

}
