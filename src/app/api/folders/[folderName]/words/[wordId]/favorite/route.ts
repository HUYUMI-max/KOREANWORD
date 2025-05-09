import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/src/lib/firebase/admin";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: any
): Promise<NextResponse> {
  const { folderName, wordId } = context.params;
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { isFavorite } = await request.json();
  if (typeof isFavorite !== "boolean") {
    return NextResponse.json(
      { error: "isFavorite must be boolean" },
      { status: 422 }
    );
  }

  const wordRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("folders")
    .doc(folderName)
    .collection("words")
    .doc(wordId);

  await wordRef.update({ isFavorite });

  const wordsSnap = await adminDb
    .collection("users")
    .doc(userId)
    .collection("folders")
    .doc(folderName)
    .collection("words")
    .get();
  const words = wordsSnap.docs.map(doc => doc.data());

  return NextResponse.json({ words }, { status: 200 });
}
