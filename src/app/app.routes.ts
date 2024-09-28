import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ImprintComponent } from './shared/imprint/imprint.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PrivacyPolicyComponent } from './shared/privacy-policy/privacy-policy.component';
import { LandingSignupDialogComponent } from './landing-page/landing-signup-dialog/landing-signup-dialog.component';
import { LandingAvatarDialogComponent } from './landing-page/landing-avatar-dialog/landing-avatar-dialog.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'signup', component: LandingSignupDialogComponent },
  { path: 'avatar-picker', component: LandingAvatarDialogComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'dashboard/privacy-policy', component: PrivacyPolicyComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'dashboard/imprint', component: ImprintComponent }
];
