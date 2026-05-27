import { 
  collection, 
  addDoc, 
  setDoc,
  doc,
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp, 
  writeBatch
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, getActiveUser } from '../lib/firebase';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  tier: 'free' | 'pro' | 'enterprise';
  createdAt: any;
}

export interface WorkspaceMember {
  userId: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
}

export const createWorkspace = async (name: string) => {
  const user = getActiveUser();
  if (!user) throw new Error("Auth required");

  const path = 'workspaces';
  try {
    const workspaceRef = doc(collection(db, 'workspaces'));
    const batch = writeBatch(db);

    const workspaceData = {
      name,
      ownerId: user.uid,
      tier: 'free',
      createdAt: serverTimestamp()
    };

    batch.set(workspaceRef, workspaceData);

    const memberRef = doc(db, `workspaces/${workspaceRef.id}/members`, user.uid);
    batch.set(memberRef, {
      userId: user.uid,
      email: user.email,
      role: 'owner',
      joinedAt: serverTimestamp()
    });

    await batch.commit();
    return workspaceRef.id;
  } catch (error: any) {
    const isPerm = error?.message?.includes('permission') || error?.code === 'permission-denied';
    if (!isPerm) {
      // Create local fallback workspace in cache
      const localId = `local_ws_${Date.now()}`;
      try {
        const cachedStr = localStorage.getItem(`workspaces_${user.uid}`);
        const list = cachedStr ? JSON.parse(cachedStr) : [];
        list.push({
          id: localId,
          name,
          ownerId: user.uid,
          tier: 'free',
          createdAt: new Date()
        });
        localStorage.setItem(`workspaces_${user.uid}`, JSON.stringify(list));
      } catch (e) {}
      return localId;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getWorkspaces = async (): Promise<Workspace[]> => {
  const user = getActiveUser();
  if (!user) return [];

  const path = 'workspaces';
  try {
    const q = query(
      collection(db, 'workspaces'),
      where('ownerId', '==', user.uid)
    );
    
    const snapshot = await getDocs(q);
    const workspaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
    try {
      localStorage.setItem(`workspaces_${user.uid}`, JSON.stringify(workspaces));
    } catch (e) {}
    return workspaces;
  } catch (error: any) {
    const isPerm = error?.message?.includes('permission') || error?.code === 'permission-denied';
    if (!isPerm) {
      try {
        const cached = localStorage.getItem(`workspaces_${user.uid}`);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {}
      
      // Default fallback workspace so user can still see/use the main UI
      const defaultWorkspace: Workspace = {
        id: `local_ws_${user.uid}`,
        name: 'My Default Workspace',
        ownerId: user.uid,
        tier: 'free',
        createdAt: new Date()
      };
      return [defaultWorkspace];
    }
    
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};
