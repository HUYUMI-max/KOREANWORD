import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/src/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

// Admin SDK を使うので Node.js ランタイムを明示
export const runtime = "nodejs";

// DELETE /api/folders/[folderName]
export async function DELETE(
  _req: NextRequest,
  context: any            // ← 型を付けずに Next の推論に任せる
) {
  const { folderName } = context.params as { folderName: string };

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // users/{uid}/folders/{folderName}
    const folderRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("folders")
      .doc(folderName);

    // words サブコレクションを一括削除
    const wordsSnap = await folderRef.collection("words").get();
    const batch = adminDb.batch();
    wordsSnap.forEach((d) => batch.delete(d.ref));

    // フォルダ本体も削除
    batch.delete(folderRef);
    await batch.commit();

    return NextResponse.json(
      { message: "Folder deleted successfully" },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("DELETE /api/folders/[folderName] error:", e);
    return NextResponse.json(
      { error: e.message ?? "Failed to delete folder" },
      { status: 500 }
    );
  }
}

