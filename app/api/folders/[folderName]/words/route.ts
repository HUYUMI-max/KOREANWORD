import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

/* -------- POST: 単語追加 -------- */
export async function POST(
  req: Request,
  context: { params: { folderName: string } }
) {
  const { folderName } = await context.params   // ★ 必ず await
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { word } = await req.json()
  const colRef = adminDb
    .collection("users").doc(userId)
    .collection("folders").doc(folderName)
    .collection("words")

  const doc = await colRef.add({ ...word, createdAt: new Date() })
  await doc.update({ id: doc.id })
  return NextResponse.json({ id: doc.id }, { status: 201 })
}

/* -------- GET: 単語一覧 -------- */
export async function GET(
  _req: Request,
  context: { params: { folderName: string } }
) {
  const { folderName } = await context.params   // ★
  const { userId }   = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const snap = await adminDb
    .collection("users").doc(userId)
    .collection("folders").doc(folderName)
    .collection("words")
    .orderBy("createdAt", "asc")
    .get()

  return NextResponse.json(snap.docs.map(d => d.data()))
}
