import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ImprintComponent } from './shared/imprint/imprint.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PrivacyPolicyComponent } from './shared/privacy-policy/privacy-policy.component';
import { HeaderComponent } from './dashboard/header/header.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: '', component: LandingPageComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'header', component: HeaderComponent },
  { path: 'imprint', component: ImprintComponent }
];
