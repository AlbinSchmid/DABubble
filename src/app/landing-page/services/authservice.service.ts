import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  user,
  GoogleAuthProvider,
  signInWithPopup,
  confirmPasswordReset,
} from '@angular/fire/auth';
import { UserInterface } from '../interfaces/userinterface';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthserviceService {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  firestore = inject(Firestore);
  router = inject(Router);

  register(email: string, username: string, password: string, avatar: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((response) => {
        // Update user profile with username and avatar
        return updateProfile(response.user, {
          displayName: username,
          photoURL: avatar,
        }).then(() => {
          const userRef = doc(this.firestore, `users/${response.user.uid}`);
          const userData: UserInterface = {
            email: response.user.email ?? '',
            username: username,
            password: password, // Save password if needed (consider security)
            avatar: avatar,
          };
          return setDoc(userRef, userData);
        });
      });

    return from(promise);
  }

  setCurrentUser(user: UserInterface | null) {
    this.currentUserSig.set(user);
  }

  // Unified method to set user data
  private setUserData(user: any): void {
    this.currentUserSig.set({
      email: user.email,
      username: user.displayName || '',
      password: '', // Not set for logged in users for security reasons
      avatar: user.photoURL || '',
    } as UserInterface);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then((response) => {
      this.setUserData(response.user);
    });

    return from(promise).pipe(
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed.'));
      })
    );
  }

  signInWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.firebaseAuth, provider).then((result) => {
      const user = result.user;
      this.setUserData(user);

      const userRef = doc(this.firestore, `users/${user.uid}`);
      const userData: UserInterface = {
        email: user.email || '',
        username: user.displayName || '',
        password: '', // Password is not applicable for Google sign-in
        avatar: user.photoURL || '',
      };
      return setDoc(userRef, userData).then(() => {
        this.router.navigate(['/avatar-picker']);
      });
    });

    return from(promise).pipe(
      catchError((error) => {
        console.error('Google sign-in error:', error);
        return throwError(() => new Error('Google login failed.'));
      })
    );
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }

  private tempUserData: UserInterface | null = null;

  setTempUserData(userData: UserInterface) {
    this.tempUserData = userData;
  }

  getTempUserData(): UserInterface | null {
    return this.tempUserData;
  }

  clearTempUserData() {
    this.tempUserData = null;
  }

  resetPassword(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.firebaseAuth, email);
    return from(promise).pipe(
      catchError((error) => {
        console.error('Error sending password reset email:', error);
        return throwError(() => error);
      })
    );
  }

  confirmPasswordReset(oobCode: string, newPassword: string): Observable<void> {
    const promise = confirmPasswordReset(this.firebaseAuth, oobCode, newPassword);

    return from(promise).pipe(
      map(() => {
        // Optionally, you can return any value or nothing
      }),
      catchError((error) => {
        console.error('Error confirming password reset:', error);
        return throwError(() => error);
      })
    );
  }
}