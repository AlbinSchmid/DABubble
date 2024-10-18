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
  updateEmail,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
  updateCurrentUser,
} from '@angular/fire/auth';
import { UserInterface } from '../interfaces/userinterface';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { doc, Firestore, getDoc, setDoc, collection, query, where, getDocs  } from '@angular/fire/firestore';
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
  errorMessage: string = '';

  register(email: string, username: string, password: string, avatar: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((response) => {
        const user = response.user;
        const uid = user.uid;
        return updateProfile(user, {
          displayName: username,
          photoURL: avatar,
        })
        .then(() => {
          const userRef = doc(this.firestore, `users/${uid}`);
          const userData: UserInterface = {
            userID: uid,
            email: user.email ?? '',
            username: username,
            password: '',  
            avatar: avatar,
            userStatus: 'on',
            isFocus: false,
          };
          return setDoc(userRef, userData);
        })
        .then(() => {
          return sendEmailVerification(user);
        });
      })
      .catch((error) => {
        console.error('Error during registration:', error);
        throw error; 
      });
  
    return from(promise);
  }




  setCurrentUser(userData: UserInterface | null): void {
    this.currentUserSig.set(userData);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then(async (response) => {
      const userRef = doc(this.firestore, `users/${response.user.uid}`);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData: UserInterface = userDoc.data() as UserInterface; 
        this.setCurrentUser(userData);
      } else {
        console.error('No such document!');
      }
    });

    return from(promise).pipe(
      catchError((error) => {
        return throwError(() => new Error('E-Mail-Adresse oder Passwort ist falsch.'));
      })
    );
  }

  signInWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.firebaseAuth, provider).then(async (result) => {
      const user = result.user;
  
      const userRef = doc(this.firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);
  
      let avatarURL: string;
      const defaultAvatarURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a';
  
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserInterface;
        avatarURL = userData.avatar || defaultAvatarURL;
      } else {
        avatarURL = defaultAvatarURL;
      }
  
      await updateProfile(user, { photoURL: avatarURL });
  
      const userData: UserInterface = {
        userID: user.uid,
        email: user.email || '',
        username: user.displayName || '',
        password: '',
        avatar: avatarURL, 
        userStatus: 'on',
        isFocus: false,
      };
  
      await setDoc(userRef, userData, { merge: true }); 
      this.setCurrentUser(userData);
      this.router.navigate(['/dashboard']);
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
      .then(async (response) => {

        const userRef = doc(this.firestore, `users/${response.user.uid}`);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData: UserInterface = userDoc.data() as UserInterface;
          this.setCurrentUser(userData);
          this.router.navigate(['/dashboard']);
        } else {
          console.error('No such document for guest user!');
        }
      });

    return from(promise).pipe(
      catchError((error) => {
        console.error('Guest login error:', error);
        return throwError(() => new Error('Guest login failed.'));
      })
    );
  }

  async updateEmail(newEmail: string, password: string): Promise<void> {
    const currentUser = this.firebaseAuth.currentUser;
  
    if (!currentUser) {
      throw new Error('No user logged in');
    }
  
    try {
      if (currentUser.email) {
        await reauthenticateWithCredential(
          currentUser,
          EmailAuthProvider.credential(currentUser.email, password)
        );
      }
      await updateEmail(currentUser, newEmail);
      await this.updateCurrentUserDetails(currentUser, newEmail);
      await sendEmailVerification(currentUser);
    } catch (error: any) {
      throw error;
    }
  }


  

  async updateCurrentUserDetails(user: any, newEmail?: string, newName?: string): Promise<void> {
    let userstatus = this.currentUserSig()?.userStatus;
    const updatedUser: UserInterface = {
      userID: user.uid,
      password: '',
      email: newEmail || user.email,
      username: newName || user.displayName,  
      avatar: user.photoURL,
      isFocus: false,
      userStatus: userstatus || 'on',
    };
  
    const userRef = doc(this.firestore, `users/${user.uid}`);
  
   
    await setDoc(userRef, updatedUser); 
  
   
    this.currentUserSig.set(updatedUser);
  }

  async updateName(newName: string): Promise<void> {
    const currentUser = this.firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error('No user logged in');
    }
  
    try {
      await updateProfile(currentUser, {
        displayName: newName,
      });
      await this.updateCurrentUserDetails(currentUser, undefined, newName); 
  
      console.log('Name successfully updated');
    } catch (error) {
      console.error('Failed to update name', error);
      throw error;
    }
  }

  async isEmailInUse(email: string): Promise<boolean> {
    const usersRef = collection(this.firestore, 'users');
    const emailQuery = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(emailQuery);
    return !querySnapshot.empty;
  }
}