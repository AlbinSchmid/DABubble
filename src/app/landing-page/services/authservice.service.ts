import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,
  signOut,updateProfile,user,GoogleAuthProvider,signInWithPopup,confirmPasswordReset,updateEmail,
  sendEmailVerification,EmailAuthProvider,reauthenticateWithCredential,
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
  guestEmail = 'gast@gast.de';
  guestPassword = 'abcdABCD1234!"§$';
  private tempUserData: UserInterface | null = null;
  private readonly defaultAvatarURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a';
  
  /**
   * Registers a new user using the provided email, username, password, and avatar.
   * Creates a new user in the Firestore 'users' collection and sets the user's display name and avatar.
   * Finally, sends an email verification email to the user.
   */
  register(email: string, username: string, password: string, avatar: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((response) => {
        const user = response.user;
        const uid = user.uid;
        return updateProfile(user, { displayName: username,photoURL: avatar,})
        .then(() => {const userRef = doc(this.firestore, `users/${uid}`); const userData: UserInterface = this.setRegisterUserData(uid , username, avatar)
          return setDoc(userRef, userData);
        })
        .then(() => { return sendEmailVerification(user);});
      })
      .catch((error) => { throw error; });
    return from(promise);
  }

/**
 * Constructs a user data object for registration with the specified user ID, username, and avatar.
 * The returned object includes default values for email, password, userStatus, and isFocus fields.
 */
  private setRegisterUserData(uid :string, username:string, avatar:string){
    return {
      userID: uid,
      email: user.email ?? '',
      username: username,
      password: '',  
      avatar: avatar,
      userStatus: 'on',
      isFocus: false,
    };
  }

/**
 * Sets the current user in the application state.
 * Updates the `currentUserSig` signal with the provided user data, which can be a `UserInterface` object or null.
 */
  setCurrentUser(userData: UserInterface | null): void {
    this.currentUserSig.set(userData);
  }

/**
 * Authenticates a user with the provided email and password.
 * On successful login, retrieves the user document from Firestore, updates the user's status to 'on',
 * sets the user data in the application state, and handles potential errors.
 */
  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then(async (response) => {
      const userRef = doc(this.firestore, `users/${response.user.uid}`);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData: UserInterface = userDoc.data() as UserInterface; 
        setDoc(userRef, { userStatus: 'on' }, { merge: true })
        this.setCurrentUser(userData);
      } else {
        console.error('No such document!');
      }
    });
    return from(promise).pipe(
      catchError((error) => { return throwError(() => new Error('E-Mail-Adresse oder Passwort ist falsch.'));})
    );
  }

  /**
   * Authenticates a user with Google Sign-In.
   * On successful login, updates the user's status to 'on',
   * sets the user data in the application state, and handles potential errors.
   */
  signInWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.firebaseAuth, provider)).pipe(
      catchError(this.handleError),
      this.handleSignInResult()
    );
  }
  
/**
 * Returns an operator function that processes the result of a sign-in attempt.
 * Subscribes to the source observable and handles the sign-in result by invoking
 * the `handleSignInSuccess` method on success, or propagates the error on failure.
 */
  private handleSignInResult() {
    return (source: Observable<any>): Observable<void> => {
      return new Observable<void>((subscriber) => {
        source.subscribe({
          next: (result) => this.handleSignInSuccess(result, subscriber),
          error: (err) => subscriber.error(err)
        });
      });
    };
  }
/**
 * Handles the success of a sign-in operation.
 * Retrieves the user's avatar URL, updates the user's profile, and constructs user data.
 * Saves the user data to the Firestore, sets the current user in the application state,
 * navigates to the dashboard, and completes the subscriber on success.
 * If any operation fails, it propagates the error to the subscriber.
 */

  private async handleSignInSuccess(result: any, subscriber: any) {
    try {
      const user = result.user;
      const avatarURL = await this.getAvatarURL(user);
      await this.updateUserProfile(user, avatarURL);
      const userData: UserInterface = this.createUserData(user, avatarURL);
      await this.saveUserData(user.uid, userData);
      this.setCurrentUser(userData);
      this.router.navigate(['/dashboard']);
      subscriber.next();
      subscriber.complete();
    } catch (error) {
      subscriber.error(error);
    }
  }

  /**
   * Retrieves the avatar URL of a user from Firestore.
   * Returns the default avatar URL if the user document does not exist or the avatar URL is not set.
   */
  private async getAvatarURL(user: any): Promise<string> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data() as UserInterface).avatar || this.defaultAvatarURL : this.defaultAvatarURL;
  }

  /**
   * Constructs a user data object from the provided user and avatar URL.
   * The returned object includes default values for email, password, userStatus, and isFocus fields.
   */
  private createUserData(user: any, avatarURL: string): UserInterface {
    return {
      userID: user.uid,
      email: user.email || '',
      username: user.displayName || '',
      password: '',
      avatar: avatarURL, 
      userStatus: 'on',
      isFocus: false,
    };
  }
  
  /**
   * Saves the user data to Firestore.
   * Merges the user data with existing document, if it exists.
   */
  private async saveUserData(uid: string, userData: UserInterface): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    await setDoc(userRef, userData, { merge: true });
  }

  /**
   * Updates the user's profile with the given avatar URL.
   */
  private async updateUserProfile(user: any, avatarURL: string): Promise<void> {
    await updateProfile(user, { photoURL: avatarURL });
  }

  /**
   * Handles errors that occur during the Google sign-in process.
   * Logs the error to the console and returns an observable that emits an error.
   */
  private handleError(error: any): Observable<never> {
    console.error('Google sign-in error:', error);
    return throwError(() => new Error('Google login failed.'));
  }

/**
 * Checks if the currently authenticated user has logged in using a Google account.
 * Returns true if the current user's authentication provider includes Google, otherwise returns false.
 */
  userLoggedWithGoogle(): boolean {
    const currentUser = this.firebaseAuth.currentUser;
    if (currentUser) {
      return currentUser.providerData.some(provider => provider.providerId === 'google.com');
    } else {
      return false;
    }
  }

  /**
   * Logs out the currently authenticated user.
   * Sets the user's status to 'off' in Firestore, then signs out the user using the Firebase authentication service.
   * After signing out, navigates the user to the root route.
   * If no user is currently logged in, returns an observable that emits an error.
   * Returns an observable that resolves to void when the logout process is complete.
   */
  logout(): Observable<void> {
    const user = this.firebaseAuth.currentUser;
    if (!user) return from(Promise.reject('No user is currently logged in.'));
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const updateStatusPromise = setDoc(userRef, { userStatus: 'off' }, { merge: true })
        .then(() => { return signOut(this.firebaseAuth);})
        .then(() => { this.router.navigate(['']); })
        .catch(error => { console.error('Error logging out:', error);throw error; });
    return from(updateStatusPromise);
  }

  /**
   * Sets the temporary user data in local storage.
   * This data is used by the sign-up process to create a new user account.
   */
  setTempUserData(userData: UserInterface) {
    this.tempUserData = userData;
  }

  /**
   * Gets the temporary user data saved in local storage.
   * This data is used by the sign-up process to create a new user account.
   * Returns null if no temporary user data is saved.
   */
  getTempUserData(): UserInterface | null {
    return this.tempUserData;
  }

/**
 * Clears the temporary user data from local storage.
 * This method sets the temporary user data to null, effectively removing any previously stored data used
 * during the sign-up process.
 */
  clearTempUserData() {
    this.tempUserData = null;
  }

  /**
   * Sends a password reset email to the specified email address.
   * Returns an observable that resolves to void when the email is sent successfully.
   * If the promise is rejected, it will return an observable that emits an error.
   */
  resetPassword(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.firebaseAuth, email);
    return from(promise).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Confirms a password reset by providing the oob code and the new password.
   * If the promise is resolved, it returns an observable that resolves to void.
   * If the promise is rejected, it will return an observable that emits an error
   */
  confirmPasswordReset(oobCode: string, newPassword: string): Observable<void> {
    const promise = confirmPasswordReset(this.firebaseAuth, oobCode, newPassword);
    return from(promise).pipe(
      map(() => {}),
      catchError((error) => {
        console.error('Error confirming password reset:', error);
        return throwError(() => error);
      })
    );
  }

/**
 * Logs in a user with guest credentials.
 * Attempts to sign in using predefined guest email and password.
 * On successful login, sets the user's status to 'on' in Firestore,
 * retrieves the user document, and navigates the guest to the dashboard.
 * If the user document does not exist, logs an error message.
 * Returns an observable that emits an error if the login process fails.
 */
  guestLogin(): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, this.guestEmail, this.guestPassword)
      .then(async (response) => {
        const userRef = doc(this.firestore, `users/${response.user.uid}`);
        setDoc(userRef, { userStatus: 'on' }, { merge: true })
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          this.navigateTheGuest(userDoc)
        } else {
          console.error('Keine solche Documente gefunden');
        }
      });
    return from(promise).pipe(
      catchError((error) => {return throwError(() => new Error('Gast login fehlgeschlagen.'));})
    );
  }

  /**
   * Navigates the guest user to the dashboard after successful login.
   * Extracts the user data from the user document and sets it as the current user.
   */
  private navigateTheGuest(userDoc: any) {
    const userData: UserInterface = userDoc.data() as UserInterface;
    this.setCurrentUser(userData);
    this.router.navigate(['/dashboard']);
  }

/**
 * Updates the current user's email address after re-authenticating with the provided password.
 * Sends an email verification to the new email address upon successful update.
 * Throws an error if no user is logged in or if any operation fails.
 */
  async updateEmail(newEmail: string, password: string): Promise<void> {
    const currentUser = this.firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    try {
      if (currentUser.email) {
        await reauthenticateWithCredential(currentUser, EmailAuthProvider.credential(currentUser.email, password));
      }
      await updateEmail(currentUser, newEmail);
      await this.updateCurrentUserDetails(currentUser, newEmail);
      await sendEmailVerification(currentUser);
    } catch (error: any) {
      throw error;
    }
  }

/**
 * Updates the current user's details in Firestore and the application state.
 * If provided, updates the user's email and/or username with the new values.
 * Constructs an updated user object and saves it to Firestore.
 * Updates the `currentUserSig` signal with the updated user data.
 */
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

  /**
   * Updates the current user's name in both the Firebase Authentication and Firestore services.
   * If no user is logged in, throws an error.
   */
  async updateName(newName: string): Promise<void> {
    const currentUser = this.firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    try {
      await updateProfile(currentUser, { displayName: newName,});
      await this.updateCurrentUserDetails(currentUser, undefined, newName); 
    } catch (error) {
      console.error('Failed to update name', error);
      throw error;
    }
  }

  /**
   * Checks if the given email is already in use by another user.
   */
  async isEmailInUse(email: string): Promise<boolean> {
    const usersRef = collection(this.firestore, 'users');
    const emailQuery = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(emailQuery);
    return !querySnapshot.empty;
  }
}