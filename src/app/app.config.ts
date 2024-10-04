import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
//test
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"dabubble-89d14","appId":"1:1035640103252:web:5715af0e3364a6163fe8c1","databaseURL":"https://dabubble-89d14-default-rtdb.europe-west1.firebasedatabase.app","storageBucket":"dabubble-89d14.appspot.com","apiKey":"AIzaSyBjwrydrQ4krA5eiSIfcLCyCshZOy9J22M","authDomain":"dabubble-89d14.firebaseapp.com","messagingSenderId":"1035640103252"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage()), provideAnimationsAsync(), provideAnimationsAsync()]
};