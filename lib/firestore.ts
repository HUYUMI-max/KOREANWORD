import { db } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

export const createVocabularyFolder = async (folderName: string) => {
  const folderRef = doc(db, "vocabLists", folderName)
  await setDoc(folderRef, {
    name: folderName,
    createdAt: serverTimestamp(),
  })
}
