import {FirebaseApp, initializeApp} from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
} from 'firebase/auth';
import {
  Firestore,
  Unsubscribe,
  connectFirestoreEmulator,
  getFirestore,
} from 'firebase/firestore';
import {
  Functions,
  connectFunctionsEmulator,
  getFunctions,
} from 'firebase/functions';
import {
  connectStorageEmulator,
  FirebaseStorage,
  getStorage,
} from 'firebase/storage';
import {makeObservable} from 'mobx';

import {
  FIREBASE_LOCAL_HOST_PORT_AUTH,
  FIREBASE_LOCAL_HOST_PORT_FIRESTORE,
  FIREBASE_LOCAL_HOST_PORT_FUNCTIONS,
  FIREBASE_LOCAL_HOST_PORT_STORAGE,
} from '../shared/constants';
import {FIREBASE_CONFIG} from '../../firebase_config';

import {Service} from './service';

/** Manages Firebase connection, experiments subscription. */
export class FirebaseService extends Service {
  constructor() {
    super();
    makeObservable(this);

    this.app = initializeApp(FIREBASE_CONFIG);
    this.firestore = getFirestore(this.app);
    this.auth = getAuth(this.app);
    this.functions = getFunctions(this.app);
    this.storage = getStorage(this.app);

    // Only register emulators if in dev mode
    if (process.env.NODE_ENV === 'development') {
      this.registerEmulators();
    }

    // Set up auth provider and scope
    this.provider = new GoogleAuthProvider();
  }

  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  functions: Functions;
  provider: GoogleAuthProvider;
  storage: FirebaseStorage;
  unsubscribe: Unsubscribe[] = [];

  registerEmulators() {
    connectFirestoreEmulator(
      this.firestore,
      'localhost',
      FIREBASE_LOCAL_HOST_PORT_FIRESTORE,
    );
    connectStorageEmulator(
      this.storage,
      'localhost',
      FIREBASE_LOCAL_HOST_PORT_STORAGE,
    );
    connectAuthEmulator(
      this.auth,
      `http://localhost:${FIREBASE_LOCAL_HOST_PORT_AUTH}`,
    );
    connectFunctionsEmulator(
      this.functions,
      'localhost',
      FIREBASE_LOCAL_HOST_PORT_FUNCTIONS,
    );
  }
}
