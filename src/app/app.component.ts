import { Component, } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutoLogoutService } from './shared/services/auto-log-out.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DaBubble';

  constructor(
    private autoLogout: AutoLogoutService
  ) { }

  onDragStart(event: DragEvent) {
    event.preventDefault();
  }
}
