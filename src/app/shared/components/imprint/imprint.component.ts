import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ViewportService } from '../../services/viewport.service';
import { BrowserTypeOnTouchService } from '../../services/browser-type-on-touch.service';


@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    RouterLink,
    CommonModule
],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  viewportService = inject(ViewportService);
  browserTypeOnTouchService = inject(BrowserTypeOnTouchService);
}
