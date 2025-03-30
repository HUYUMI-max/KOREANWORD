"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SearchBar from "./searchBar"
import { Card } from "@/components/ui/card"

interface Flashcard {
  id: string
  korean: string
  japanese: string
}

export default function FlashcardArea({ level }: { level: "初心者" | "中級" | "上級" | null}) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState("")


  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    setCurrentIndex(0)
  }
  
  

  useEffect(() => {
    if (!level) return
  

    fetch("/data/VocabularyAll.json")
      .then((res) => res.json())
      .then((data) => {
        const selectedCards: Flashcard[] = data[level].map((item: any) => ({
          id: String(item.id),
          korean: item.korean,
          japanese: item.japanese,
        }))

        setCards(selectedCards)
        setFilteredCards(selectedCards)
        setCurrentIndex(0)
        setIsFlipped(false)
      })
  }, [level])

  useEffect(() => {

    console.log(" 検索キーワード:", searchKeyword)
    console.log(" フィルター対象のカード数:", cards.length)

    const results = cards.filter((card) =>
      (typeof card.korean === "string" && card.korean.includes(searchKeyword)) ||
      (typeof card.japanese === "string" && card.japanese.includes(searchKeyword))
    )

      console.log(" フィルター結果の数:", results.length)
    if (results.length > 0) {
      console.log(" 最初のヒット:", results[0])
  }
  
    setFilteredCards(results)
    setCurrentIndex(0)
  }, [searchKeyword])
  
  
  
  

  const handleNext = () => {
    setIsFlipped(false)
    console.log("次へ:", currentIndex, "→", (currentIndex + 1) % cards.length, "（総数:", cards.length, "）")
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }
  

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => {
      const prevIndex = (prev - 1 + cards.length) % cards.length
      console.log("前へ:", prev, "→", prevIndex, "（総数:", cards.length, "）")
      return prevIndex
    })
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const safeIndex = Math.min(currentIndex, filteredCards.length - 1)
  const selectedCard = filteredCards[safeIndex]
    if (!selectedCard) {
    console.log("selectedCard がまだ undefined です。データ読み込み前の状態。")
  } else {
    console.log("表示中のカード:", {
      currentIndex,
      selectedCard,
      total: cards.length
    })
  }
  

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar onSearch={handleSearch} />
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={handlePrevious} disabled={filteredCards.length <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {selectedCard && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCard?.id}-${isFlipped ? "back" : "front"}`}
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
                      <h2 className="text-3xl font-bold text-center">{selectedCard?.korean}</h2>
                    </div>
                    <div className="absolute w-full h-full flex items-center justify-center p-6 [transform:rotateY(180deg)] backface-hidden">
                      <h2 className="text-3xl font-bold text-center">{selectedCard?.japanese}</h2>
                    </div>
                  </motion.div>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}
          <Button variant="outline" size="icon" onClick={handleNext} disabled={filteredCards.length <= 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">カードをクリックして裏返す</p>
      </div>
    </div>
  )
}
