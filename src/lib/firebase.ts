import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let guestUser: any = null;

export const setGuestUser = (user: any) => {
  guestUser = user;
};

export const getActiveUser = () => {
  return guestUser || auth.currentUser;
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // Gracefully handle common "cancellation" errors to avoid noisy logs
    if (
      error.code === 'auth/popup-closed-by-user' || 
      error.code === 'auth/cancelled-popup-request' ||
      error.code === 'auth/user-cancelled'
    ) {
      throw error; // Rethrow but don't log
    }
    console.error("Auth Error:", error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error("Popup blocked by your browser. Please allow popups for this site or open the app in a new tab to sign in.");
    }
    throw error;
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const isPerm = errorMsg.toLowerCase().includes('permission') || 
                 errorMsg.toLowerCase().includes('insufficient') ||
                 (error as any)?.code === 'permission-denied';

  const activeUser = getActiveUser();
  const errInfo: FirestoreErrorInfo = {
    error: errorMsg,
    authInfo: {
      userId: activeUser?.uid,
      email: activeUser?.email,
      emailVerified: activeUser?.emailVerified,
      isAnonymous: activeUser?.isAnonymous,
      tenantId: activeUser?.tenantId,
      providerInfo: activeUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  
  if (isPerm) {
    console.error('Firestore Permission Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    // For other connection/offline errors, do not format as a permission breakdown JSON, just throw standard error
    console.warn(`Firestore Network/Connectivity: ${errorMsg} (Path: ${path}, Op: ${operationType})`);
    throw error instanceof Error ? error : new Error(errorMsg);
  }
}

// CRITICAL CONNECTION TEST
async function testConnection() {
  try {
    console.log("Testing Firestore connection... Database ID:", firebaseConfig.firestoreDatabaseId);
    // Try to get a non-existent doc from server to verify connection
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test completed (document doesn't exist but server responded).");
  } catch (error) {
    if(error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.warn("Firestore is offline. This usually means the browser cannot reach Firestore or the Database ID is incorrect.");
      } else {
        console.warn("Firestore connection warning:", error.message);
      }
    }
  }
}
testConnection();
