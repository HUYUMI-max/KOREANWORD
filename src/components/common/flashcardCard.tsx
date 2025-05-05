"use client"

import { useState } from "react"
import { Card } from "@/src/components/ui/card"
import { motion } from "framer-motion"
import { Flashcard } from "@/src/types/flashcard"
import { Trash2 } from "lucide-react"

/* ─────────────────────────────────────────
   props ―★ isFavorite / onToggleFavorite は
           “お気に入り機能” を使う時だけ渡せば OK
────────────────────────────────────────── */
interface FlashcardCardProps {
  card: Flashcard
  onDelete: (wordId: string) => void
  /** ↓ optional --------------- ↓ */
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export default function FlashcardCard({
  card,
  onDelete,
  isFavorite = false,          // optional のデフォルト
  onToggleFavorite,            // optional
}: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  /* ---------------- ハンドラ ---------------- */
  const handleFlip = () => setIsFlipped(!isFlipped)

  /* ---------------- JSX ---------------- */
  return (
    <Card
      className="relative w-[300px] h-[200px]"
      onClick={handleFlip}
    >
      {/* ★ お気に入りボタン ― optional */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation()      // 親 onClick をキャンセル
            e.preventDefault()
            onToggleFavorite()
          }}
          className="absolute top-2 right-2 z-10"
          aria-label="お気に入り切替"
        >
          {isFavorite ? "★" : "☆"}
        </button>
      )}

      {/* 🗑️ 削除ボタン */}
      <button
        className="absolute top-2 right-10 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onDelete(card.id)
        }}
        aria-label="単語を削除"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* 表 / 裏 のアニメーションカード */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="w-full h-full [transform-style:preserve-3d] pointer-events-none"
      >
        {/* 表 */}
        <div className="absolute w-full h-full flex items-center justify-center p-6 backface-hidden">
          <h2 className="text-3xl font-bold text-center">{card.korean}</h2>
        </div>

        {/* 裏 */}
        <div className="absolute w-full h-full flex items-center justify-center p-6 [transform:rotateY(180deg)] backface-hidden">
          <h2 className="text-3xl font-bold text-center">{card.japanese}</h2>
        </div>
      </motion.div>
    </Card>
  )
}
