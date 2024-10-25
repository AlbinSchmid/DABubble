import { Component, inject, ViewChild } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { ChannelsUserlistComponent } from './channels-userlist/channels-userlist.component';
import { MessengerComponent } from './messenger/messenger.component';
import { ThreadComponent } from './thread/thread.component';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ThreadService } from '../shared/services/thread-service/thread.service';
import { MessengerService } from '../shared/services/messenger-service/messenger.service';
import { Router } from '@angular/router';
import { AuthserviceService } from '../landing-page/services/authservice.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserInterface } from '../landing-page/interfaces/userinterface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HeaderComponent,
    ChannelsUserlistComponent,
    MessengerComponent,
    ThreadComponent,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @ViewChild('drawer') drawer!: MatDrawer;

  authService: AuthserviceService = inject(AuthserviceService);
  threadService: ThreadService = inject(ThreadService);
  messengerService: MessengerService = inject(MessengerService);
  router: Router = inject(Router);

  isUserLoaded = false;
  isLoggingOut = false;
  isSideNavOpen: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.authService.user$.subscribe((user: UserInterface | null) => {
      if (user) {
        this.isUserLoaded = true;
      } else {
        this.isUserLoaded = false;
      }
    });
  }

  toggleSideNav(): void {
    this.drawer.toggle();
    setTimeout(() => this.isSideNavOpen = !this.isSideNavOpen, 100);
  }
}
