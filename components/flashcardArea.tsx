"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SearchBar from "./searchBar"
import { Switch } from "@/components/ui/switch"
import FlashcardCard, { Flashcard } from "./flashcardCard"




export default function FlashcardArea({ level }: { level: "初心者" | "中級" | "上級" | null}) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [direction, setDirection] = useState<"next" | "prev">("next")




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
        // setIsFlipped(false)
      })
  }, [level])

  useEffect(() => {
    const baseResults = searchKeyword === ""
      ? cards
      : cards.filter((card) =>
      (typeof card.korean === "string" && card.korean.includes(searchKeyword)) ||
      (typeof card.japanese === "string" && card.japanese.includes(searchKeyword))
    )

    const finalResults = showFavoritesOnly
    ? baseResults.filter(card => favorites.includes(`${level}-${card.id}`))
    : baseResults
  
    setFilteredCards(finalResults)
    setCurrentIndex(0)
  }, [searchKeyword, cards, favorites, showFavoritesOnly])
  
  
  
  

  const handleNext = () => {
    setDirection("next")
    // setIsFlipped(false)
    // console.log("次へ:", currentIndex, "→", (currentIndex + 1) % cards.length, "（総数:", cards.length, "）")
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length)
  }
  

  const handlePrevious = () => {
    setDirection("prev")
    // setIsFlipped(false)
    setCurrentIndex((prev) => {
      const prevIndex = (prev - 1 + filteredCards.length) % filteredCards.length
      // console.log("前へ:", prev, "→", prevIndex, "（総数:", cards.length, "）")
      return prevIndex
    })
  }


  const toggleFavorite = () => {
    if (!selectedCard || !level) return

    const key = `${level}-${selectedCard.id}`
  
    setFavorites((prev) =>
      prev.includes(key)
        ? prev.filter((id) => id !== key) 
        : [...prev, key] 
    )
  }


  const safeIndex = Math.min(currentIndex, filteredCards.length - 1)
  const selectedCard = filteredCards[safeIndex]
  const isFavorite = selectedCard && level ? favorites.includes(`${level}-${selectedCard.id}`) : false
    if (!selectedCard) {
    console.log("selectedCard がまだ undefined です。データ読み込み前の状態。")
  } else {
    console.log("表示中のカード:", {
      currentIndex,
      selectedCard,
      total: cards.length
    })
  }

  const variants = {
    enter: (direction: "next" | "prev") => ({
      opacity: 0,
      x: direction === "next" ? 100 : -100,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (direction: "next" | "prev") => ({
      opacity: 0,
      x: direction === "next" ? -100 : 100,
    }),
  }
  
  

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar onSearch={handleSearch} />
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 mb-4">
          <Switch checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} />
          <span className="text-sm">お気に入りだけを表示</span>
        </div>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={handlePrevious} disabled={filteredCards.length <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {selectedCard && (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={selectedCard.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="perspective-1000"
              >
              <FlashcardCard
                card={selectedCard}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
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
