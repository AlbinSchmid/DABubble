import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss'
})
export class MessengerComponent {

  show(event: any) {
    console.log(event);
    
  }
}
