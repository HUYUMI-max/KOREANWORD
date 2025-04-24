import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, updateDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { firebaseConfig } from "../config/firebaseConfig"
import { Flashcard } from "@/lib/types"

// Firebase アプリの初期化（初回のみ）
const app = initializeApp(firebaseConfig)

// Firestore と Auth をエクスポート
export const db = getFirestore(app)
export const auth = getAuth(app)

/**
 * 単語を Firestore に追加する関数
 * @param uid - Clerk で取得した user.id（App Router では useUser() から取得して渡す）
 * @param listName - 単語リストの名前（"default"など）
 * @param word - 単語データ（Flashcard 型から id を除いたもの）
 */
export const addWordToFirestore = async (
  uid: string,
  listName: string,
  word: Omit<Flashcard, "id">
) => {
  const collectionRef = collection(db, "users", uid, "words") // 🔐セキュリティルールに対応したパス

  const docRef = await addDoc(collectionRef, {
    ...word,
    list: listName,
    createdAt: new Date(),
  })

  // Firestore 上にも `id` フィールドを追加（後から使いやすくなる）
  await updateDoc(docRef, { id: docRef.id })

  console.log("✅ Firestoreに単語を追加しました！ID:", docRef.id)
}
