"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Flashcard {
  id: string
  korean: string
  japanese: string
}

export default function FlashcardArea({ level }: { level: "初心者" | "中級" | "上級" | null}) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    if (!level) return

    console.log("クリックされた", level)

    fetch("/data/VocabularyAll.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("現在のレベル:", level)
        console.log("JSONデータ読み込み成功:", data)
        const selectedCards: Flashcard[] = data[level].map((item: any) => ({
          id: String(item.id),
          korean: item.korean,
          japanese: item.japanese,
        }))

        console.log("取得した単語数:", selectedCards.length)

        setCards(selectedCards)
        setCurrentIndex(0)
        setIsFlipped(false)
      })
      .catch((error) => {
        console.error("JSON読み込みエラー", error)
      })
  }, [level])

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={handlePrevious} disabled={cards.length <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {cards.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="perspective-1000"
              >
                <Card className="w-[300px] h-[200px] cursor-pointer bg-card" onClick={handleFlip}>
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full [transform-style:preserve-3d]"
                  >
                    <div className="absolute w-full h-full flex items-center justify-center p-6 backface-hidden">
                      <h2 className="text-3xl font-bold text-center">{cards[currentIndex].korean}</h2>
                    </div>
                    <div className="absolute w-full h-full flex items-center justify-center p-6 [transform:rotateY(180deg)] backface-hidden">
                      <h2 className="text-3xl font-bold text-center">{cards[currentIndex].japanese}</h2>
                    </div>
                  </motion.div>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}
          <Button variant="outline" size="icon" onClick={handleNext} disabled={cards.length <= 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">カードをクリックして裏返す</p>
      </div>
    </div>
  )
}
