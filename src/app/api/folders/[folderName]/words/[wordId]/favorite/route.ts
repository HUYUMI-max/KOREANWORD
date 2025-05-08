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
      { error: "isFavorite must be a boolean" },
      { status: 400 }
    );
  }

  const doc = adminDb
    .collection("users")
    .doc(userId)
    .collection("folders")
    .doc(folderName)
    .collection("words")
    .doc(wordId);

  await doc.update({ isFavorite });
  return NextResponse.json({ success: true });
}
