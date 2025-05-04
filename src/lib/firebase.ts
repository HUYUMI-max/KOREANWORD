import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../../config/firebaseConfig";
import { Flashcard } from "@/src/lib/types";

// Firebase 初期化（クライアント）
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * フォルダ内に単語を追加する関数（修正済み）
 * @param uid - Clerk で取得した user.id
 * @param folderName - フォルダ名（listと同じ）
 * @param word - 単語データ
 */
export const addWordToFirestore = async (
  uid: string,
  folderName: string,
  word: Omit<Flashcard, "id">
) => {
  const collectionRef = collection(db, "users", uid, "folders", folderName, "words"); // ← 🔧 修正

  const docRef = await addDoc(collectionRef, {
    ...word,
    createdAt: new Date(),
  });

  await updateDoc(docRef, { id: docRef.id });

  console.log("Firestoreに単語を追加しました！ID:", docRef.id);
};
