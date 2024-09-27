import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-channels-userlist',
  standalone: true,
  imports: [
    MatCardModule
  ],
  templateUrl: './channels-userlist.component.html',
  styleUrl: './channels-userlist.component.scss'
})
export class ChannelsUserlistComponent {

}
