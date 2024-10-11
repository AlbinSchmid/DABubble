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
} from '@angular/fire/auth';
import { UserInterface } from '../interfaces/userinterface';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { doc, Firestore, getDoc, setDoc, collection, query, where, getDocs  } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

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
            password: '',
            avatar: avatar,
            userStatus: 'on',
            isFocus: false,
          };
          return setDoc(userRef, userData);
        });
      });

    return from(promise);
  }




  setCurrentUser(userData: UserInterface | null): void {
    this.currentUserSig.set(userData);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then(async (response) => {
      // Fetch user data from Firestore after logging in
      const userRef = doc(this.firestore, `users/${response.user.uid}`);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData: UserInterface = userDoc.data() as UserInterface; // Cast to UserInterface
        this.setCurrentUser(userData);
      } else {
        console.error('No such document!');
      }
    });

    return from(promise).pipe(
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => new Error('Die E-Mail-Adresse oder das Passwort ist falsch.'));
      })
    );
  }

  signInWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.firebaseAuth, provider).then(async (result) => {
      const user = result.user;
      const photoURL = user.photoURL;

      if (!photoURL) {
        console.error('No photo URL available from Google.');
        return;
      }

      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}.png`);

      const response = await fetch(photoURL);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        await uploadString(storageRef, base64data, 'data_url');


        const downloadURL = await getDownloadURL(storageRef);

        const userRef = doc(this.firestore, `users/${user.uid}`);
        const userData: UserInterface = {
          userID: user.uid,
          email: user.email || '',
          username: user.displayName || '',
          password: '',
          avatar: downloadURL,
          userStatus: 'on',
          isFocus:false,

        };
        await setDoc(userRef, userData);
        this.setCurrentUser(userData);
        this.router.navigate(['/dashboard']);
      };
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

  async changeEmail(newEmail: string): Promise<void> {
    const user = this.firebaseAuth.currentUser;

    if (!user) {
      return Promise.reject(new Error('Kein Benutzer ist derzeit angemeldet.'));
    }

    const isGoogleUser = user.providerData.some(provider => provider.providerId === 'google.com');

    if (isGoogleUser) {
      return Promise.reject(new Error('E-Mail kann bei Google-Anmeldungen nicht geändert werden. Bitte erstelle ein neues Konto.'));
    }

    // Setze die neue E-Mail
    await updateEmail(user, newEmail);

    // Sende die Verifizierungs-E-Mail
    await sendEmailVerification(user);

    console.log('Eine Verifizierungs-E-Mail wurde gesendet. Bitte überprüfe deine E-Mails.');
  }

  async isEmailInUse(email: string): Promise<boolean> {
    const usersRef = collection(this.firestore, 'users');
    const emailQuery = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(emailQuery);
    return !querySnapshot.empty;
  }
}