import {
  updateProfile,
  updatePassword,
  updateEmail,
  verifyBeforeUpdateEmail,
  deleteUser,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
  AUTH = 'auth',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
  };

  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------
// UTILS
// ----------------------------

/**
 * Filter out undefined values from an object before sending to Firestore
 */
const sanitizeData = (data: any) => {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
};

/* ---------------- FAVORITES ---------------- */

export const addToFavorites = async (userId: string, movie: any, mediaType: string) => {
  const path = 'favorites';
  try {
    const docRef = await addDoc(collection(db, path), {
      userId,
      itemId: movie.id,
      mediaType,
      title: movie.title || movie.name,
      posterPath: movie.poster_path,
      addedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const removeFromFavorites = async (favoriteId: string): Promise<boolean> => {
  const path = `favorites/${favoriteId}`;
  try {
    await deleteDoc(doc(db, 'favorites', favoriteId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const getFavorites = async (userId: string): Promise<any[]> => {
  const path = 'favorites';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

/* ---------------- COMMENTS ---------------- */

export const addComment = async (itemId: number, text: string, rating: number) => {
  if (!auth.currentUser) return;

  const path = 'comments';

  try {
    await addDoc(collection(db, path), {
      itemId,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'مستخدم مجهول',
      userPhoto: auth.currentUser.photoURL || null,
      text,
      rating,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getComments = async (itemId: number): Promise<any[]> => {
  const path = 'comments';

  try {
    const q = query(
      collection(db, path),
      where('itemId', '==', itemId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

/* ---------------- USER PROFILE ---------------- */

export const createUserProfile = async (user: any) => {
  const userRef = doc(db, 'users', user.uid);

  try {
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, sanitizeData({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isPremium: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lastUpdated: serverTimestamp(),
      }));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);

    return snap.exists() ? snap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  }
};

export const updateUserSettings = async (userId: string, settings: any) => {
  const userRef = doc(db, 'users', userId);
  try {
    // If displayName or photoURL are updated, also update Firebase Auth profile
    const currentUser = auth.currentUser;
    if (currentUser) {
      const authUpdates: any = {};
      if (settings.displayName !== undefined) authUpdates.displayName = settings.displayName;
      if (settings.photoURL !== undefined) authUpdates.photoURL = settings.photoURL;
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(currentUser, authUpdates);
      }
    }

    await setDoc(userRef, sanitizeData({
      ...settings,
      lastUpdated: serverTimestamp(),
    }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
};

export const changeUserPassword = async (newPassword: string) => {
  if (!auth.currentUser) throw new Error('No user logged in');
  try {
    await updatePassword(auth.currentUser, newPassword);
  } catch (error) {
    handleFirestoreError(error, OperationType.AUTH, 'auth/updatePassword');
  }
};

export const changeUserEmail = async (newEmail: string) => {
  if (!auth.currentUser) throw new Error('No user logged in');
  try {
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
  } catch (error) {
    handleFirestoreError(error, OperationType.AUTH, 'auth/verifyBeforeUpdateEmail');
  }
};

export const deleteUserAccount = async () => {
  if (!auth.currentUser) throw new Error('No user logged in');
  const userId = auth.currentUser.uid;
  try {
    await deleteDoc(doc(db, 'users', userId));
    await deleteUser(auth.currentUser);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
};

export const togglePremiumStatus = async (userId: string, status: boolean) => {
  const userRef = doc(db, 'users', userId);
  try {
    await setDoc(userRef, {
      isPremium: status,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
};

/* ---------------- WATCHING PROGRESS ---------------- */

export const saveWatchingProgress = async (userId: string, progress: any) => {
  const path = `users/${userId}/progress`;
  try {
    const progressRef = doc(db, 'users', userId, 'progress', `${progress.type}_${progress.id}`);
    await setDoc(progressRef, sanitizeData({
      ...progress,
      updatedAt: serverTimestamp(),
    }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getWatchingProgress = async (userId: string): Promise<any[]> => {
  const path = `users/${userId}/progress`;
  try {
    const q = query(collection(db, 'users', userId, 'progress'), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const clearWatchingProgress = async (userId: string) => {
  const path = `users/${userId}/progress`;
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'progress'));
    const deletes = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletes);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
