// lib/firestore.ts
// Clerk は import せず、userId は必ず引数でもらう設計に統一

import { db } from "@/src/lib/firebase/client";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * 単語をフォルダに追加
 * Firestore パス: users/{userId}/folders/{folderName}/words/{wordId}
 */
export const addWordToFirestore = async (
  userId: string,
  folderName: string,
  word: { korean: string; japanese: string }
) => {
  const wordRef = doc(
    db,
    "users",
    userId,
    "folders",
    folderName,
    "words",
    crypto.randomUUID()
  );
  await setDoc(wordRef, { ...word, createdAt: serverTimestamp() });
};

/**
 * 単語をフォルダから削除
 * `flashcardArea.tsx` などから呼び出される
 */
export const deleteWordFromFolder = async (
  userId: string,
  folderName: string,
  wordId: string
) => {
  const res = await fetch(
    `/api/folders/${encodeURIComponent(folderName)}/words/${encodeURIComponent(wordId)}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  if (!res.ok) {
    const msg = await res.text();
    console.error("DELETE WORD ERROR:", msg);
    throw new Error("Failed to delete word");
  }
};
