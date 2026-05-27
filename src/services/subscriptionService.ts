import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserSubscription {
  uid: string;
  email?: string;
  displayName?: string;
  trialStartedAt: any;
  dailyAttempts: {
    [dateKey: string]: number;
  };
  subscriptionType: 'none' | 'weekly' | 'biweekly' | 'monthly';
  subscriptionExpiresAt: any;
  isAccountActive: boolean;
}

export const getSubscriptionData = async (uid: string, email?: string | null, displayName?: string | null): Promise<UserSubscription | null> => {
  const path = `subscriptions/${uid}`;
  try {
    const userRef = doc(db, 'subscriptions', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const newData: any = {
        uid,
        email: email || '',
        displayName: displayName || 'User',
        trialStartedAt: serverTimestamp(),
        dailyAttempts: {},
        subscriptionType: 'none',
        subscriptionExpiresAt: null,
        isAccountActive: true
      };
      // Only set if we actually have data, otherwise fallback to empty string to avoid Firestore errors
      await setDoc(userRef, newData);
      
      const sub = { ...newData, trialStartedAt: new Date() };
      try {
        localStorage.setItem(`sub_${uid}`, JSON.stringify(sub));
      } catch (e) {}
      return sub;
    }
    
    const sub = userSnap.data() as UserSubscription;
    try {
      localStorage.setItem(`sub_${uid}`, JSON.stringify(sub));
    } catch (e) {}
    return sub;
  } catch (error: any) {
    const isPerm = error?.message?.includes('permission') || error?.code === 'permission-denied';
    if (isPerm) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }

    // Try to load cached data from localStorage
    try {
      const cached = localStorage.getItem(`sub_${uid}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}

    // Fallback document so users don't get blocked
    const fallbackSub: UserSubscription = {
      uid,
      email: email || '',
      displayName: displayName || 'User',
      trialStartedAt: new Date(),
      dailyAttempts: {},
      subscriptionType: 'none',
      subscriptionExpiresAt: null,
      isAccountActive: true
    };
    return fallbackSub;
  }
};

const toDate = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val.toDate === 'function') return val.toDate();
  if (val && typeof val === 'object' && 'seconds' in val) {
    return new Timestamp(val.seconds, val.nanoseconds || 0).toDate();
  }
  try {
    return new Date(val);
  } catch (e) {
    return new Date();
  }
};

export const getRemainingDays = (expiresAt: any): number => {
  if (!expiresAt) return 0;
  const now = new Date();
  const expiry = toDate(expiresAt);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const canPerformAttempt = async (uid: string): Promise<{ allowed: boolean; reason?: 'trial_expired' | 'limit_reached' | 'subscription_expired'; remaining?: number }> => {
  const sub = await getSubscriptionData(uid);
  if (!sub) return { allowed: false };

  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
  
  // Check if subscribed
  const expiresAt = toDate(sub.subscriptionExpiresAt);
  const isSubscribed = sub.subscriptionExpiresAt && expiresAt > now;
  
  if (isSubscribed) {
    return { allowed: true }; // Subscribed users have unlimited daily attempts (or a much higher limit if you prefer, but usually unlimited)
  }

  // Check trial window (7 days)
  const trialStart = toDate(sub.trialStartedAt);
  const trialDaysElapsed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
  
  if (trialDaysElapsed >= 7) {
    return { allowed: false, reason: 'trial_expired' };
  }

  // Check daily limit (4 attempts)
  const todayCount = sub.dailyAttempts[dateKey] || 0;
  if (todayCount >= 4) {
    return { allowed: false, reason: 'limit_reached', remaining: 0 };
  }

  return { allowed: true, remaining: 4 - todayCount };
};

export const recordAttempt = async (uid: string) => {
  const dateKey = new Date().toISOString().split('T')[0];
  const path = `subscriptions/${uid}`;
  
  // Predictively increment local cache for instant offline reactivity
  try {
    const cached = localStorage.getItem(`sub_${uid}`);
    if (cached) {
      const data = JSON.parse(cached);
      data.dailyAttempts = data.dailyAttempts || {};
      data.dailyAttempts[dateKey] = (data.dailyAttempts[dateKey] || 0) + 1;
      localStorage.setItem(`sub_${uid}`, JSON.stringify(data));
    }
  } catch (e) {}

  try {
    const userRef = doc(db, 'subscriptions', uid);
    await updateDoc(userRef, {
      [`dailyAttempts.${dateKey}`]: increment(1)
    });
  } catch (error: any) {
    const isPerm = error?.message?.includes('permission') || error?.code === 'permission-denied';
    if (isPerm) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } else {
      console.warn("Firestore recordAttempt offline fallback active:", error.message || error);
    }
  }
};

export const submitPayment = async (uid: string, plan: string, transactionId: string, email?: string | null, displayName?: string | null) => {
  const paymentPath = `payments/${transactionId}`;
  const subPath = `subscriptions/${uid}`;
  
  const now = new Date();
  let durationDays = 7;
  if (plan === 'weekly') durationDays = 7;
  if (plan === 'biweekly') durationDays = 15;
  if (plan === 'monthly') durationDays = 30;
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // Optimistically set localized access
  try {
    const sub = {
      uid,
      email: email || '',
      displayName: displayName || 'User',
      trialStartedAt: new Date(),
      dailyAttempts: {},
      subscriptionType: plan,
      subscriptionExpiresAt: expiresAt,
      isAccountActive: true
    };
    localStorage.setItem(`sub_${uid}`, JSON.stringify(sub));
  } catch (e) {}

  try {
    const paymentRef = doc(db, 'payments', transactionId);
    await setDoc(paymentRef, {
      uid,
      plan,
      transactionId,
      email: email || 'unknown',
      displayName: displayName || 'User',
      status: 'completed',
      createdAt: serverTimestamp()
    });

    const userRef = doc(db, 'subscriptions', uid);
    const updateData: any = {
      subscriptionType: plan,
      subscriptionExpiresAt: expiresAt,
      isAccountActive: true,
    };
    if (email) updateData.email = email;
    if (displayName) updateData.displayName = displayName;

    await updateDoc(userRef, updateData);
  } catch (error: any) {
    const isPerm = error?.message?.includes('permission') || error?.code === 'permission-denied';
    if (isPerm) {
      handleFirestoreError(error, OperationType.WRITE, `${paymentPath} / ${subPath}`);
    } else {
      console.warn("Firestore submitPayment offline fallback active:", error.message || error);
    }
  }
};

export const getAllPayments = async () => {
  const path = 'payments';
  try {
    const { getDocs, query, orderBy, collection } = await import('firebase/firestore');
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getAllSubscriptions = async () => {
  const path = 'subscriptions';
  try {
    const { getDocs, collection } = await import('firebase/firestore');
    const subsRef = collection(db, 'subscriptions');
    const querySnapshot = await getDocs(subsRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const adminRemoveSubscription = async (uid: string) => {
  const path = `subscriptions/${uid}`;
  try {
    const userRef = doc(db, 'subscriptions', uid);
    await updateDoc(userRef, {
      subscriptionType: 'none',
      subscriptionExpiresAt: null,
      isAccountActive: false
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};
