import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/folders/[folderName]
export async function DELETE(
  request: NextRequest,
  context: { params: { folderName: string } } // ← これが重要！
) {
  const { folderName } = context.params;

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folderRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("folders")
      .doc(folderName);

    const wordSnapshot = await folderRef.collection("words").get();
    const batch = adminDb.batch();

    wordSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    batch.delete(folderRef);
    await batch.commit();

    return NextResponse.json({ message: "Folder deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/folders/[folderName] error:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
