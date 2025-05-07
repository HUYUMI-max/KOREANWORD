import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/src/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// DELETE: 単語をフォルダから削除
export async function DELETE(
  _req: NextRequest,
  context: any
) {
  const { folderName, wordId } = context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const wordRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("folders")
      .doc(folderName)
      .collection("words")
      .doc(wordId);

    await wordRef.delete();

    return NextResponse.json({ message: "Word deleted successfully" }, { status: 200 });
  } catch (e: any) {
    console.error("DELETE /api/folders/[folderName]/words/[wordId] error:", e);
    return NextResponse.json({ error: e.message ?? "Failed to delete word" }, { status: 500 });
  }
} 