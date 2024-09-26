import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ImprintComponent } from './shared/imprint/imprint.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'landing-login-dialog', component: LandingPageComponent },
  { path: 'imprint', component: ImprintComponent }
];
