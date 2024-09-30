import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly FIRST_VISIT_KEY = 'firstVisitLandingPage';

  constructor() { }

  isFirstVisit(): boolean {
    const hasVisited = sessionStorage.getItem(this.FIRST_VISIT_KEY);
    if (!hasVisited) {
      sessionStorage.setItem(this.FIRST_VISIT_KEY, 'true'); 
      return true; 
    }
    return false; 
  }
}
