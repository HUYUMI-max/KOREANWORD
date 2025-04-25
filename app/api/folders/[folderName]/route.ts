import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

// DELETE /api/folders/[folderName]
export async function DELETE(
  _req: Request,
  { params }: { params: { folderName: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folderRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("folders")
      .doc(params.folderName);

    // サブコレクション words を取得
    const wordsSnapshot = await folderRef.collection("words").get();

    // バッチで削除（全 words を削除）
    const batch = adminDb.batch();
    wordsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // フォルダ本体も削除
    batch.delete(folderRef);

    // 一括実行
    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/folders/[folderName] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
