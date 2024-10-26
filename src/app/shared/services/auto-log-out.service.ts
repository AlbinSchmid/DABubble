import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { Router } from '@angular/router';


const MINUTES_UNITL_AUTO_LOGOUT = 5;
const CHECK_INTERVAL = 1000;

@Injectable({
  providedIn: 'root',
})
export class AutoLogoutService implements OnDestroy {
  private lastAction: number;
  private visibilityChangeHandler: (event: Event) => void;
  constructor(
    private auth: AuthserviceService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
    this.reset(); 
    this.initListener();
    this.initInterval();
  }

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
  }


  initListener() {
    this.ngZone.runOutsideAngular(() => {
      document.body.addEventListener('click', () => this.reset());
      document.body.addEventListener('keypress', () => this.reset());
      document.body.addEventListener('mousemove', () => this.reset());
      document.body.addEventListener('touchstart', () => this.reset());
    });
  }

  initInterval() {
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => this.check(), CHECK_INTERVAL);
    });
  }

  reset() {
    this.lastAction = Date.now();
  }

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
        this.router.navigate(['login']);
      }
    });
  }

  private handleVisibilityChange(event: Event) {
    if (document.hidden) {
      this.auth.logout();
    }
  }
}