import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { firebaseConfig } from "@/config/firebaseConfig"
import { Flashcard } from "@/lib/types"
// Firebase アプリの初期化
const app = initializeApp(firebaseConfig)

// Firestore と Auth をエクスポート
export const db = getFirestore(app)
export const auth = getAuth(app)

// 単語を Firestore に追加する関数
export const addWordToFirestore = async (
  listName: string,
  word: Omit<Flashcard, "id">
) => {
  try {
    const docRef = await addDoc(collection(db, "vocabLists", listName, "words"), word)
    console.log("単語を追加しました！ID:", docRef.id)
  } catch (error) {
    console.error("Firestoreへの単語追加に失敗しました:", error)
    throw error
  }
}
