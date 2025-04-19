import { db } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore"

export const createVocabularyFolder = async (folderName: string) => {
  const folderRef = doc(db, "vocabLists", folderName)
  await setDoc(folderRef, {
    name: folderName,
    createdAt: serverTimestamp(),
  })
}

export const deleteWordFromFolder = async (folderName: string, wordId: string) => {
    console.log("deleteWordFromFolderが呼び出されました", { folderName, wordId });
    try {
      await deleteDoc(doc(db, "vocabLists", folderName, "words", wordId));
      console.log("単語の削除が成功しました");
    } catch (error) {
      console.error("単語の削除中にエラーが発生しました:", error);
      throw error;
    }
  }
