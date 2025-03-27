"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import FlashcardArea from "@/components/flashcardArea"

export default function AppShell() {
  const [level, setLevel] = useState<"初心者" | "中級" | "上級" | null>(null)

  return (
    <div className="flex flex-1">
      <Sidebar onSelectLevel={setLevel} />
      <main className="flex-1 p-6">
        <FlashcardArea level={level} />
      </main>
    </div>
  )
}
