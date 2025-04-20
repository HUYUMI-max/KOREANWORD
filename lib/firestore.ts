import { db } from "../lib/firebase"
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore"

export const createVocabularyFolder = async (folderName: string) => {
  const folderRef = doc(db, "vocabLists", folderName)
  await setDoc(folderRef, {
    name: folderName,
    createdAt: serverTimestamp(),
  })
}

export const deleteWordFromFolder = async (folderName: string, wordId: string) => {
    await deleteDoc(doc(db, "vocabLists", folderName, "words", wordId))
  }
