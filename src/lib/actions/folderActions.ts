"use client";

/**
 * フォルダを作成するクライアントサイド関数
 */
export const createVocabularyFolder = async (folderName: string) => {
  const res = await fetch("/api/folders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Clerk セッションを送信
    body: JSON.stringify({ folderName }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("CREATE ERROR:", error);
    throw new Error("Failed to create folder");
  }

  return res.json();
};

/**
 * フォルダを削除するクライアントサイド関数
 * API エンドポイントを `/api/folders/[folderName]` に変更
 */
export const deleteVocabularyFolder = async (folderName: string) => {
  const res = await fetch(`/api/folders/${encodeURIComponent(folderName)}`, {
    method: "DELETE",
    credentials: "include", // Clerk セッションを送信
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("DELETE ERROR:", error);
    throw new Error("Failed to delete folder");
  }

  return res.json();
};
