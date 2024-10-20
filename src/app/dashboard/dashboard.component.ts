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
import { MessageComponent } from '../shared/components/message/message.component';
import { OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthserviceService } from '../landing-page/services/authservice.service';

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
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent  {
  @ViewChild('drawer') drawer!: MatDrawer;
  isSideNavOpen: boolean = true;
  private routerSubscription: Subscription;
  authService = inject(AuthserviceService)
  router: Router = inject(Router)
  isLoggingOut = false;
  constructor(public threadService: ThreadService, public messengerService: MessengerService) {

  }

  /**
   * Listen to router events and logout when navigating away from /dashboard
   */

  


  /**
   * Toggle the side navigation drawer open or closed.
   * 
   * When the drawer is opened or closed, the isSideNavOpen flag is updated
   * after a short delay to ensure the animation has finished.
   */
  toggleSideNav(): void {
    this.drawer.toggle();
    setTimeout(() => this.isSideNavOpen = !this.isSideNavOpen, 100);
  }
}