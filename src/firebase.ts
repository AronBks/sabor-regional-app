import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: '<FIREBASE_API_KEY>',
  authDomain: '<FIREBASE_PROJECT>.firebaseapp.com',
  projectId: '<FIREBASE_PROJECT>',
  storageBucket: '<FIREBASE_PROJECT>.appspot.com',
  messagingSenderId: '<MSG_SENDER_ID>',
  appId: '<APP_ID>'
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
