import { inject, Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user } from '@angular/fire/auth';
import { UserInterface } from '../interfaces/userinterface';
import { catchError, from, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {
  firebaseAuth = inject(Auth)
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<UserInterface|null|undefined>(undefined)

  register(email:string, username:string , password:string):Observable<void>{
    const promise = createUserWithEmailAndPassword(
    this.firebaseAuth,
    email,
    password,
    ).then((response) => 
      updateProfile(response.user, { displayName: username}),
    );
    return from(promise);
  }

  setCurrentUser(user: UserInterface | null) {
    this.currentUserSig.set(user); // Set the user data to the signal
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
}
