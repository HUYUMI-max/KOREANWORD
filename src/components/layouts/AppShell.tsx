"use client"

import { useState } from "react"
import Sidebar from "@/src/components/layouts/sidebar"
import FlashcardArea from "@/src/components/features/flashcard/flashcardArea"

export interface AppShellProps {
  children?: React.ReactNode;   // ← ★ 追加
}

export default function AppShell({ children }: AppShellProps) {
  const [level, setLevel] = useState<"初心者" | "中級" | "上級" | null>(null)
  const [list, setList] = useState<string | null>(null) // マイ単語帳の選択状態を管理

  const handleSelectLevel = (selectedLevel: "初心者" | "中級" | "上級") => {
    setLevel(selectedLevel)
    setList(null) // マイ単語帳が開かれている状態を解除
  }

  return (
    <div className="flex flex-1">
      <Sidebar 
        onSelectLevel={handleSelectLevel}
        onSelectList={(name) => {
          setLevel(null) // レベル選択状態を解除
          setList(name)  // マイ単語帳をセット
          console.log("マイ単語帳を開いた:", name)
        }}
      />
      <main className="flex-1 p-6">
        <FlashcardArea 
          level={level} 
          list={list} 
          onSelectLevel={handleSelectLevel}
          onSelectList={(name) => {
            setLevel(null)
            setList(name)
            console.log("マイ単語帳を開いた:", name)
          }}
        />
      </main>
    </div>
  )
}
