import { inject, Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword,sendPasswordResetEmail, signOut, updateProfile, user, updatePassword, confirmPasswordReset } from '@angular/fire/auth';
import { UserInterface } from '../interfaces/userinterface';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {
  firebaseAuth = inject(Auth)
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface|null|undefined>(undefined)
  firestore = inject(Firestore);

  register(email: string, username: string, password: string, avatar: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((response) => {
  
        return updateProfile(response.user, {
          displayName: username,
          photoURL: avatar 
        }).then(() => {
          const userRef = doc(this.firestore, `users/${response.user.uid}`);
          const userData = {
            email: response.user.email ?? '',
            username: username,
            photoURL: avatar
          };
          return setDoc(userRef, userData); 
        });
      });
  
    return from(promise);
  }

  setCurrentUser(user: UserInterface | null) {
    this.currentUserSig.set(user); 
  }


  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password);
    return from(promise).pipe(
      map(() => {
        return;
      }),
      catchError((error) => {
        const errorCode = error.code;
        if (
          errorCode === 'auth/wrong-password' || 
          errorCode === 'auth/user-not-found' || 
          errorCode === 'auth/invalid-credential' || 
          errorCode === 'auth/invalid-email' || 
          errorCode === 'auth/operation-not-allowed'
        ) {
          console.warn('Login failed with known issue:', error.message);
          
          return throwError(() => new Error('Ungültige E-Mail-Adresse oder Passwort.'));
        }
        console.error('Unhandled error:', error);
        return throwError(() => error); 
      })
    );
  }



  logout(): Observable <void>{
    const promise = signOut(this.firebaseAuth);
    return from(promise)
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
