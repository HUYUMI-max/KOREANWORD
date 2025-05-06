// Server‑onlyユーティリティ
import { adminDb } from "../firebase/admin"

export type Word = {
  id: string;
  korean: string;
  japanese: string;
  createdAt?: number;
};

/**
 * フォルダ内の単語を「createdAt 昇順」で取得する  
 * @param userId Clerk の `userId`
 * @param folderName Firestore 上のフォルダ名
 * @throws Firestore / ネットワークエラー
 */
export async function getWordsInFolder(
  userId: string,
  folderName: string
): Promise<Word[]> {
  const snap = await adminDb
    .collection("users")
    .doc(userId)
    .collection("folders")
    .doc(folderName)
    .collection("words")
    .orderBy("createdAt", "asc")
    .get();

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Word[];
}
