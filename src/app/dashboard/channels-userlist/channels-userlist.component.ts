import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-channels-userlist',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './channels-userlist.component.html',
  styleUrl: './channels-userlist.component.scss'
})
export class ChannelsUserlistComponent {

}
