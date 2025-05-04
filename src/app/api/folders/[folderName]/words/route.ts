// app/api/folders/[folderName]/words/route.ts
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/src/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

/* GET: 特定フォルダの単語一覧を取得 */
export async function GET(_req: Request, context: any) {
  const { folderName } = context.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });

  const snap = await adminDb
    .collection("users")
    .doc(userId)
    .collection("folders")
    .doc(folderName)
    .collection("words")
    .orderBy("createdAt", "asc")
    .get();

  const words = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(words);
}


/* POST: 単語をフォルダに追加 */
export async function POST(req: NextRequest, context: any) {
  const { folderName } = context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { korean, japanese } = await req.json();

  if (!korean || !japanese) {
    return NextResponse.json({ error: "Invalid word data" }, { status: 400 });
  }

  const colRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("folders")
    .doc(folderName)
    .collection("words");

  const docRef = await colRef.add({
    korean,
    japanese,
    createdAt: new Date(),
  });

  await docRef.update({ id: docRef.id });

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
