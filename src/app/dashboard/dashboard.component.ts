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
import { Subject, takeUntil, timeout } from 'rxjs';

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

  userFound$ = new Subject<void>();

  isUserLoaded = false;
  isLoggingOut = false;
  isSideNavOpen: boolean = true;

  constructor() { }

  /**
   * OnInit lifecycle hook. Starts observing the user stream from the AuthService
   * with a timeout of 5 seconds, navigating to the home page if the user is not found.
   */
  ngOnInit(): void {
    this.authService.user$
      .pipe(
        timeout(5000), takeUntil(this.userFound$)
      )
      .subscribe(
        (user: UserInterface | null) => {
          if (user) {
            this.setUserFound();
          } else {
            this.isUserLoaded = false;
          }
        },
        (err: any) => { this.handleError(err); }
      );
  }

  /**
   * Sets the userLoaded flag to true and completes the userFound$ observable
   * to indicate that the user stream has been loaded and observed.
   */
  setUserFound() {
    this.isUserLoaded = true;
    this.userFound$.next();
    this.userFound$.complete();
  }

  /**
   * Handles errors that occur during the authentication and user loading process.
   * If the error is a timeout error, it navigates to the home page and shows an alert
   * prompting the user to try again. If the error is any other type, it navigates to
   * the home page and shows an alert with the error message.
   * @param {any} err The error object to be handled.
   */
  handleError(err: any) {
    if (err.name === 'TimeoutError') {
      this.router.navigate(['']);
      alert('Zeitüberschreitung, versuchen Sie es bitte erneut!');
    } else {
      this.router.navigate(['']);
      alert('Ein unerwarteter Fehler ist aufgetreten:' + err.message);
    }
  }

  /**
   * Toggles the side navigation drawer and updates its open/close state.
   */
  toggleSideNav(): void {
    this.drawer.toggle();
    setTimeout(() => this.isSideNavOpen = !this.isSideNavOpen, 100);
  }

  /**
   * OnDestroy lifecycle hook. Completes the userFound subject to clean up resources.
   */
  ngOnDestroy(): void {
    this.userFound$.complete();
  }
}
