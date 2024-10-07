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
      const uid = response.user.uid; 
      return updateProfile(response.user, {
        displayName: username,
        photoURL: avatar,
      }).then(() => {
        const userRef = doc(this.firestore, `users/${uid}`);
        const userData: UserInterface = {
          userID: uid, 
          email: response.user.email ?? '',
          username: username,
          password: password, 
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

  
  private setUserData(user: any): void {
    this.currentUserSig.set({
      email: user.email,
      username: user.displayName || '',
      password: '', 
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
        userID:user.uid || '',
        email: user.email || '',
        username: user.displayName || '',
        password: '', 
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
    this.router.navigate(['/']);
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
      }),
      catchError((error) => {
        console.error('Error confirming password reset:', error);
        return throwError(() => error);
      })
    );
  }

  guestLogin(): Observable<void> {
    const guestEmail = 'gast@gast.de';
    const guestPassword = 'abcdABCD1234!"§$'; 
  
    const promise = signInWithEmailAndPassword(this.firebaseAuth, guestEmail, guestPassword)
      .then((response) => {
        this.setUserData(response.user); 
        this.router.navigate(['/dashboard']); 
      });
  
    return from(promise).pipe(
      catchError((error) => {
        console.error('Guest login error:', error);
        return throwError(() => new Error('Guest login failed.'));
      })
    );
  }
}