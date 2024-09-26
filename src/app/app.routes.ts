import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ImprintComponent } from './shared/imprint/imprint.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MessengerComponent } from './dashboard/messenger/messenger.component';

export const routes: Routes = [
  { path: 'dashboard', component: MessengerComponent },
  { path: '', component: LandingPageComponent },
  { path: 'imprint', component: ImprintComponent }
];
