// lib/firestore.ts  – もう Clerk を import しない
import { db } from "@/lib/firebase"
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"

// userId を “引数” でもらう関数だけ残す
export const addWordToFirestore = async (
  userId: string,
  folderName: string,
  word: { korean: string; japanese: string }
) => {
  const wordRef = doc(db, "users", userId, "folders", folderName, "words", crypto.randomUUID())
  await setDoc(wordRef, { ...word, createdAt: serverTimestamp() })
}
