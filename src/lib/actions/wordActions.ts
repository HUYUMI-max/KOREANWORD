"use client"

/**
 * フォルダ内に単語を追加する（App Router API 経由）
 */
export const addWordToFolder = async (
  folderName: string,
  word: { korean: string; japanese: string }
) => {
  const res = await fetch(
    `/api/folders/${encodeURIComponent(folderName)}/words`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",          // Clerk セッション Cookie を送る
      body: JSON.stringify({ korean: word.korean, japanese: word.japanese }),
    }
  )

  if (!res.ok) {
    console.error("ADD WORD ERROR:", await res.text())
    throw new Error("Failed to add word")
  }
  return res.json() as Promise<{ id: string }>
}

/* ★ フォルダ内の単語を取得する */
export const fetchWordsInFolder = (folderName: string) =>
    fetch(`/api/folders/${encodeURIComponent(folderName)}/words`, {
      method: "GET",
      credentials: "include",
    }).then((r) => r.json())