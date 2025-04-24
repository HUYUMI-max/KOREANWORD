"use client";


// フォルダを作成
export const createVocabularyFolder = async (folderName: string) => {
  const res = await fetch("/api/folders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Clerkセッションを送る！
    body: JSON.stringify({ folderName }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("CREATE ERROR:", error);
    throw new Error("Failed to create folder");
  }

  return res.json();
};

// フォルダを削除
export const deleteVocabularyFolder = async (folderName: string) => {
  const res = await fetch(`/api/folders?folderName=${encodeURIComponent(folderName)}`, {
    method: "DELETE",
    credentials: "include", // 必ずつける！
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("DELETE ERROR:", error);
    throw new Error("Failed to delete folder");
  }

  return res.json();
};

// フォルダ一覧を取得
export const fetchVocabularyFolders = async (): Promise<string[]> => {
  const res = await fetch("/api/folders", {
    credentials: "include", // これも
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("FETCH ERROR:", error);
    throw new Error("Failed to fetch folders");
  }

  const { data } = await res.json();
  console.log("folders from API:", data); // ← これ追加
  return data.map((folder: any) => folder.id);
};
