import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [
    CommonModule,
    TextareaComponent
  ],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {

  sourceThread = false;

  constructor() { }

}
