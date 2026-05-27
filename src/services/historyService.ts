import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp, 
  writeBatch,
  doc,
  limit,
  Firestore,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, getActiveUser } from '../lib/firebase';
import { EngineeringReview } from './geminiService';

export interface AuditLog {
  userId: string;
  action: string;
  timestamp: any;
}

export interface StoredReport {
  id: string;
  code: string;
  review: EngineeringReview;
  userId: string;
  workspaceId: string;
  githubContext?: {
    repository: string;
    branch: string;
    commit: string;
  };
  createdAt: any;
}

export const saveReport = async (
  code: string, 
  review: EngineeringReview, 
  workspaceId: string,
  githubContext?: { repository: string; branch: string; commit: string }
) => {
  const user = getActiveUser();
  if (!user || !workspaceId) return;

  const path = `workspaces/${workspaceId}/audits`;
  const logPath = `workspaces/${workspaceId}/audit_logs`;
  
  const auditData: any = {
    code,
    review,
    userId: user.uid,
    authorName: user.displayName,
    workspaceId,
    githubContext: githubContext || null,
    createdAt: new Date()
  };

  try {
    const batch = writeBatch(db);
    const auditRef = doc(collection(db, path));
    
    const dbAuditData = {
      ...auditData,
      createdAt: serverTimestamp()
    };

    batch.set(auditRef, dbAuditData);

    const logRef = doc(collection(db, logPath));
    batch.set(logRef, {
      auditId: auditRef.id,
      action: 'CREATED',
      userId: user.uid,
      userName: user.displayName,
      timestamp: serverTimestamp()
    });

    await batch.commit();

    // Cache to localStorage
    try {
      const reportsKey = `history_${workspaceId}`;
      const cachedStr = localStorage.getItem(reportsKey);
      const list = cachedStr ? JSON.parse(cachedStr) : [];
      list.unshift({ id: auditRef.id, ...auditData });
      localStorage.setItem(reportsKey, JSON.stringify(list));
    } catch (e) {}

    return auditRef.id;
  } catch (error: any) {
    const isPerm = error?.message?.includes('permission') || error?.code === 'permission-denied';
    if (!isPerm) {
      const localId = `local_audit_${Date.now()}`;
      try {
        const reportsKey = `history_${workspaceId}`;
        const cachedStr = localStorage.getItem(reportsKey);
        const list = cachedStr ? JSON.parse(cachedStr) : [];
        list.unshift({
          id: localId,
          ...auditData
        });
        localStorage.setItem(reportsKey, JSON.stringify(list));
      } catch (e) {}
      return localId;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const findCachedAudit = async (workspaceId: string, code: string): Promise<StoredReport | null> => {
  const user = getActiveUser();
  if (!user || !workspaceId) return null;

  const path = `workspaces/${workspaceId}/audits`;
  try {
    const q = query(
      collection(db, path),
      where('code', '==', code),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as StoredReport;
    }
    return null;
  } catch (error) {
    // Try local storage searching if offline
    try {
      const reportsKey = `history_${workspaceId}`;
      const cachedStr = localStorage.getItem(reportsKey);
      if (cachedStr) {
        const list = JSON.parse(cachedStr);
        const match = list.find((item: any) => item.code === code);
        if (match) return match;
      }
    } catch (e) {}
    console.error("Cache check failed:", error);
    return null;
  }
};

export const getHistory = async (workspaceId: string): Promise<StoredReport[]> => {
  const user = getActiveUser();
  if (!user || !workspaceId) return [];

  const path = `workspaces/${workspaceId}/audits`;
  try {
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StoredReport[];

    try {
      localStorage.setItem(`history_${workspaceId}`, JSON.stringify(history));
    } catch (e) {}
    return history;
  } catch (error: any) {
    const isPerm = error?.message?.includes('permission') || error?.code === 'permission-denied';
    if (!isPerm) {
      try {
        const cached = localStorage.getItem(`history_${workspaceId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {}
      return [];
    }
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};
