import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

console.log("env.projectId:", process.env.FIREBASE_PROJECT_ID);
console.log("env.clientEmail:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("env.privateKey exists:", !!process.env.FIREBASE_PRIVATE_KEY);


// --- Firebase Admin SDK の認証情報 ---
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// --- App の初期化 ---
const app: App =
  getApps().length === 0
    ? initializeApp({ credential: cert(firebaseAdminConfig) })
    : getApps()[0];

// --- 明示的に export ---
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
