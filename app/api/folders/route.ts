import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { folderName } = body;

    await adminDb
      .collection("users")
      .doc(userId)
      .collection("folders")
      .doc(folderName)
      .set({
        name: folderName,
        createdAt: new Date(),
      });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/folders error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("folders")
      .get();

    const folders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(folders);
  } catch (e: any) {
    console.error("GET /api/folders error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
