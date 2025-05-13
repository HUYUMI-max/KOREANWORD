"use client"

import { useState } from "react"
import { Card } from "@/src/components/ui/card"
import { motion } from "framer-motion"
import { Flashcard } from "@/src/types/flashcard"
import { Trash2, Loader2 } from "lucide-react"

/* ─────────────────────────────────────────
   props ―★ isFavorite / onToggleFavorite は
           "お気に入り機能" を使う時だけ渡せば OK
────────────────────────────────────────── */
interface FlashcardCardProps {
  card: Flashcard
  onDelete: (wordId: string) => void
  /** ↓ optional --------------- ↓ */
  isFavorite?: boolean
  onToggleFavorite?: () => void
  isUpdating?: boolean  // 追加: ローディング状態
  isDeleting?: boolean  // 追加: 削除中の状態
}

export default function FlashcardCard({
  card,
  onDelete,
  isFavorite = false,          // optional のデフォルト
  onToggleFavorite,            // optional
  isUpdating = false,  // 追加: デフォルト値
  isDeleting = false,  // 追加: デフォルト値
}: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  /* ---------------- ハンドラ ---------------- */
  const handleFlip = () => setIsFlipped(!isFlipped)

  /* ---------------- JSX ---------------- */
  return (
    <Card
      className="relative w-[300px] h-[200px] bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700"
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
          disabled={isUpdating}
          className="absolute top-2 right-2 z-10 text-2xl text-yellow-400 hover:scale-110 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="お気に入り切替"
        >
          {isUpdating ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            isFavorite ? "★" : "☆"
          )}
        </button>
      )}

      {/* 削除ボタン */}
      <button
        className="absolute bottom-2 right-2 text-red-500 hover:text-red-600 p-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onDelete(card.id)
        }}
        disabled={isDeleting}
        aria-label="単語を削除"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>

      {/* 表 / 裏 のアニメーションカード */}
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="w-full h-full [transform-style:preserve-3d] pointer-events-none"
      >
        {/* 表 */}
        <div className="absolute w-full h-full flex items-center justify-center p-6 backface-hidden">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">{card.korean}</h2>
        </div>

        {/* 裏 */}
        <div className="absolute w-full h-full flex items-center justify-center p-6 [transform:rotateY(180deg)] backface-hidden">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">{card.japanese}</h2>
        </div>
      </motion.div>
    </Card>
  )
}
