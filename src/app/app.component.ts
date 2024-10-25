import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthserviceService } from './landing-page/services/authservice.service';


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

  constructor(private authService: AuthserviceService) {}

  onDragStart(event: DragEvent) {
    event.preventDefault();
  }
  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    this.authService.logout(); // Call your logout function here
  }
}
