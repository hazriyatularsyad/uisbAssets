// import { initializeApp } from "firebase/app"
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   addDoc,
//   doc,
//   getDoc,
//   updateDoc,
//   deleteDoc,
// } from "firebase/firestore"
// import { query, where } from "firebase/firestore"
// import {
//   getAuth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
// } from "firebase/auth"
// import type { Asset } from "./types"

// export type FirebaseAsset = Omit<Asset, "id"> & {
//   [key: string]: any
// }

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// }

// const hasFirebaseConfig = Boolean(
//   firebaseConfig.apiKey &&
//   firebaseConfig.authDomain &&
//   firebaseConfig.projectId &&
//   firebaseConfig.storageBucket &&
//   firebaseConfig.messagingSenderId &&
//   firebaseConfig.appId,
// )

// let app = null as ReturnType<typeof initializeApp> | null
// let db = null as ReturnType<typeof getFirestore> | null
// let auth = null as ReturnType<typeof getAuth> | null

// if (hasFirebaseConfig) {
//   app = initializeApp(firebaseConfig)
//   db = getFirestore(app)
//   auth = getAuth(app)
// } else {
//   console.warn(
//     "Firebase is not configured. Set VITE_FIREBASE_API_KEY and other VITE_FIREBASE_* values in .env to enable Firebase.",
//   )
// }

// function ensureFirebaseInitialized() {
//   if (!hasFirebaseConfig || !db || !auth) {
//     throw new Error(
//       "Firebase is not configured. Set VITE_FIREBASE_* variables in .env to use Firestore and Auth.",
//     )
//   }
// }

// export async function getAssets(): Promise<Asset[]> {
//   ensureFirebaseInitialized()
//   const col = collection(db!, "assets")
//   const snap = await getDocs(col)
//   return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
// }

// export async function addAsset(asset: FirebaseAsset) {
//   ensureFirebaseInitialized()
//   // ensure category saved in categories collection
//   try {
//     if (asset.category) await addCategory(String(asset.category))
//   } catch (err) {
//     // non-fatal
//     console.warn("Failed to ensure category saved:", err)
//   }

//   const col = collection(db!, "assets")
//   const ref = await addDoc(col, asset)
//   return ref.id
// }

// export async function getAssetById(id: string): Promise<Asset | null> {
//   ensureFirebaseInitialized()
//   const d = await getDoc(doc(db!, "assets", id))
//   if (!d.exists()) return null
//   return { id: d.id, ...(d.data() as any) }
// }

// export async function updateAsset(id: string, data: Partial<Asset>) {
//   ensureFirebaseInitialized()
//   // if category changed/exists, ensure it's present in categories collection
//   try {
//     if (data.category) await addCategory(String(data.category))
//   } catch (err) {
//     console.warn("Failed to ensure category saved on update:", err)
//   }

//   const d = doc(db!, "assets", id)
//   await updateDoc(d, data as any)
// }

// // Categories helpers
// export async function getCategories(): Promise<string[]> {
//   ensureFirebaseInitialized()
//   const col = collection(db!, "categories")
//   const snap = await getDocs(col)
//   return snap.docs.map((d) => String((d.data() as any).name || d.id))
// }

// export async function addCategory(name: string) {
//   ensureFirebaseInitialized()
//   if (!name || !name.trim()) return null
//   const trimmed = name.trim()
//   // avoid duplicates
//   const q = query(collection(db!, "categories"), where("name", "==", trimmed))
//   const existing = await getDocs(q)
//   if (existing.size > 0) return existing.docs[0].id
//   const ref = await addDoc(collection(db!, "categories"), { name: trimmed })
//   return ref.id
// }

// export async function deleteAsset(id: string) {
//   ensureFirebaseInitialized()
//   const d = doc(db!, "assets", id)
//   await deleteDoc(d)
// }

// export async function signUp(email: string, password: string) {
//   if (!hasFirebaseConfig || !auth) {
//     throw new Error(
//       "Firebase Auth is not configured. Set VITE_FIREBASE_* variables in .env.",
//     )
//   }
//   return createUserWithEmailAndPassword(auth, email, password)
// }

// export async function signIn(email: string, password: string) {
//   if (!hasFirebaseConfig || !auth) {
//     throw new Error(
//       "Firebase Auth is not configured. Set VITE_FIREBASE_* variables in .env.",
//     )
//   }
//   return signInWithEmailAndPassword(auth, email, password)
// }

// export async function signOutUser() {
//   if (!hasFirebaseConfig || !auth) {
//     throw new Error(
//       "Firebase Auth is not configured. Set VITE_FIREBASE_* variables in .env.",
//     )
//   }
//   return signOut(auth)
// }

// export { db, auth }
