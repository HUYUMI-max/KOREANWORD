import { auth } from "@clerk/nextjs/server";  // Clerk Auth
import { adminDb } from "@/lib/firebaseAdmin";  // Firebase Admin SDK
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/folders/[folderName]
export async function DELETE(request: NextRequest, { params }: { params: { folderName: string } }) {
  const { folderName } = params;

  try {
    // Clerk で認証されたユーザーの userId を取得
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Firestore からの削除処理を実行
    const folderRef = adminDb
      .collection("users")
      .doc(userId)  // userId は Clerk で取得した値
      .collection("folders")
      .doc(folderName);

    // フォルダ内の単語データを削除
    const wordSnapshot = await folderRef.collection("words").get();
    const batch = adminDb.batch();

    // 単語を削除
    wordSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    // フォルダを削除
    batch.delete(folderRef);

    // 一括削除をコミット
    await batch.commit();

    return NextResponse.json({ message: "Folder deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
