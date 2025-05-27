// scripts/testAdmin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount as any) });
}

(async () => {
  try {
    await getFirestore().doc('__test__/ping').get();
    console.log('✅ すべての環境変数が正しいです');
  } catch (err) {
    console.error('❌ 認証に失敗:', err);
  }
})();
