import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BrowserTypeOnTouchService } from '../../services/browser-type-on-touch.service';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    MatCardModule,
    RouterLink,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  browserTypeOnTouchService = inject(BrowserTypeOnTouchService);
}
