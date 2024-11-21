import { Injectable, NgZone } from '@angular/core';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { Router } from '@angular/router';

const MINUTES_UNITL_AUTO_LOGOUT = 5; 
const CHECK_INTERVAL = 1000; 

@Injectable({
  providedIn: 'root',
})
export class AutoLogoutService {
  private lastAction: number;

  constructor(
    private auth: AuthserviceService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.reset();
    this.initListener();
    this.initInterval();
    this.initVisibilityListener();
    this.initTabCloseListener(); 
  }

/**
 * Initializes event listeners for user activity to reset the last action timestamp.
 * Listens for click, keypress, mouse movement, and touchstart events on the document body.
 * Runs outside of Angular's zone to avoid triggering change detection unnecessarily.
 */
  initListener() {
    this.ngZone.runOutsideAngular(() => {
      document.body.addEventListener('click', () => this.reset());
      document.body.addEventListener('keypress', () => this.reset());
      document.body.addEventListener('mousemove', () => this.reset());
      document.body.addEventListener('touchstart', () => this.reset());
    });
  }

/**
 * Initializes an interval to check whether the user should be logged out due to
 * inactivity every CHECK_INTERVAL milliseconds. Runs outside of Angular's zone
 * to avoid triggering change detection unnecessarily.
 */
  initInterval() {
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => this.check(), CHECK_INTERVAL);
    });
  }

  /**
   * Resets the last action timestamp to the current time. This is called
   * whenever the user interacts with the application, such as by clicking
   * or typing. This resets the countdown to auto-logout.
   */
  reset() {
    this.lastAction = Date.now();
  }

  /**
   * Checks whether the user should be logged out due to inactivity every CHECK_INTERVAL milliseconds.
   * If the user has not interacted with the application for MINUTES_UNITL_AUTO_LOGOUT minutes, logs out the user
   * and navigates to the login page.
   */
  check() {
    if (!this.auth.currentUserSig()) {
      return;
    }
    const now = Date.now();
    const timeleft = this.lastAction + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;
    const isTimeout = diff < 0;
    this.ngZone.run(() => {
      if (isTimeout) {
        this.auth.logout();
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * Initializes a listener for the visibilitychange event to detect when the
   * user switches to a different tab. If the user switches to a different tab,
   * this calls the handleTabHidden function to log out the user after a delay.
   */
  initVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleTabHidden();
      }
    });
  }

  /**
   * Handles the visibilitychange event when the user switches to a different tab.
   * If the user switches to a different tab, this logs out the user after a delay.
   * If the user is reloading the tab, this does not log out the user.
   */
  handleTabHidden() {
    const isReloading = sessionStorage.getItem('isReloading');
    if (isReloading) {
      sessionStorage.removeItem('isReloading');
      return;
    }
    this.ngZone.run(() => {
      this.auth.logout();
      this.router.navigate(['/']);
    });
  }

/**
 * Initializes event listeners for the 'beforeunload' and 'unload' events to handle tab or window closure.
 * The 'beforeunload' event sets a sessionStorage flag to indicate a potential page reload.
 * The 'unload' event checks this flag, and if the page is not reloading, logs out the user.
 * Runs the logout process within Angular's zone to ensure proper change detection.
 */
  initTabCloseListener() {
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('isReloading', 'true');
    });
    window.addEventListener('unload', () => {
      const isReloading = sessionStorage.getItem('isReloading');
      if (!isReloading) {
        this.ngZone.run(() => {
          this.auth.logout();
        });
      }
    });
  }
}