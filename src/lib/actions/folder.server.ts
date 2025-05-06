// Server‑onlyユーティリティ  ※"use client" を書かない
import { adminDb } from "../firebase/admin";

export type Folder = {
  id: string;
  /** 追加で持たせているフィールドがあれば適宜追加してください */
  name?: string;
  createdAt?: number;
};

/**
 * 指定ユーザーのフォルダ一覧を取得する  
 * @param userId Clerk の `userId`
 * @throws Firestore / ネットワークエラー
 */
export async function getFolders(userId: string): Promise<Folder[]> {
  const snap = await adminDb
    .collection("users")
    .doc(userId)
    .collection("folders")
    .get();

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Folder[];
}
