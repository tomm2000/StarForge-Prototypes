// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { FirebaseStorage, getStorage } from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBRZAUAtiRRsPyy5draej0YnelSnto8IOk",
  authDomain: "starforge-3b903.firebaseapp.com",
  projectId: "starforge-3b903",
  storageBucket: "starforge-3b903.appspot.com",
  messagingSenderId: "1078095247446",
  appId: "1:1078095247446:web:68e4bf8be2ab92379ea3f7",
  measurementId: "G-T9QPLR9C9F"
};

let app: FirebaseApp
let analytics: Analytics
let storage: FirebaseStorage

let isInitialized = false

export function initFirebaseApp() {
  if(isInitialized) { return }
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  storage = getStorage()

  isInitialized = true

}

export function getFirebaseApp() {
  if(!isInitialized) { throw 'firebase not initialized!' }
  return { app, analytics, storage }
}
