import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';


@Component({
  selector: 'app-channels-userlist',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule, MatTreeModule
  ],
  templateUrl: './channels-userlist.component.html',
  styleUrl: './channels-userlist.component.scss'
})
export class ChannelsUserlistComponent {

  channels: string[] = ['Entwicklerteam', 'UI-Team', 'SecOps-Team']
}
