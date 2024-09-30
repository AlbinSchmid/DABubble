import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-start-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start-animation.component.html',
  styleUrl: './start-animation.component.scss'
})
export class StartAnimationComponent {
  isVisible = true; // Control the visibility of the section

  ngAfterViewInit() {
    const section = document.querySelector('section');

    
    setTimeout(() => {
      this.isVisible = false; 
    }, 4000); 
  }
}


