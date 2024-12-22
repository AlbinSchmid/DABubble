import { Component, Host, HostListener, inject, ViewChild } from '@angular/core';
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
import { Subject, takeUntil, timeout, timer } from 'rxjs';
import { onAuthStateChanged } from '@angular/fire/auth';
import { NewMessageComponent } from './new-message/new-message.component';
import { ViewportService } from '../shared/services/viewport.service';
import { BrowserTypeOnTouchService } from '../shared/services/browser-type-on-touch.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HeaderComponent,
    NewMessageComponent,
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
  @ViewChild('drawerThread') drawerThread!: MatDrawer;

  viewportService: ViewportService = inject(ViewportService);
  authService: AuthserviceService = inject(AuthserviceService);
  threadService: ThreadService = inject(ThreadService);
  messengerService: MessengerService = inject(MessengerService);
  browserTypeOnTouchService: BrowserTypeOnTouchService = inject(BrowserTypeOnTouchService);
  router: Router = inject(Router);

  userFound$ = new Subject<void>();

  isUserLoaded = false;
  isLoggingOut = false;
  isSideNavOpen: boolean = true;
  errorMessage: string | null = null;


  /**
   * Lifecycle hook that is called after the component's data-bound properties are initialized.
   * Subscribes to the authentication state changes to handle user login and logout.
   * If a user is authenticated, the handleUserLogin method is called, otherwise, the current user is set to null.
   * Additionally, initiates a user search process.
   */
  ngOnInit(): void {
    onAuthStateChanged(this.authService.firebaseAuth, (user) => {
      if (user) {
        this.authService.handleUserLogin(user);
      } else {
        this.authService.setCurrentUser(null);
      }
    });
    this.searchUser();
  }


  /**
   * Listens to the user observable and sets the userFound flag as soon as a user is found.
   * If no user is found within 5 seconds, the userLoaded flag is set to false.
   * If an error occurs, the error is handled with a delay.
   */
  searchUser(): void {
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
        (err: any) => { this.handleErrorWithDelay(err); }
      );
  }


  /**
   * Sets the userLoaded flag to true and completes the userFound$ observable
   * to indicate that the user stream has been loaded and observed.
   */
  setUserFound(): void {
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
  handleErrorWithDelay(err: any): void {
    const errorMessage = err.name === 'TimeoutError' ? 'Zeitüberschreitung, versuchen Sie es bitte erneut!' : 'Ein unerwarteter Fehler ist aufgetreten: ' + err.message;
    this.errorMessage = errorMessage;
    timer(2000).subscribe(() => {
      this.errorMessage = null;
      this.router.navigate(['']);
    });
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


  @HostListener('window:resize', ['$event'])
  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Reinitializes the current user based on the current user authenticated with the Firebase Authentication service
   * whenever the window is resized. This is necessary because the user's status is not updated automatically
   * when the user's window size changes.
   * @param event The window resize event.
  */
  /******  813f4125-627b-475c-9822-d85353630a86  *******/
  onResize(event: any): void {
    this.authService.reinitializeUser();
  }
}
