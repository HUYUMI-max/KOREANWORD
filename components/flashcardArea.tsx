"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SearchBar from "./searchBar"
import { Switch } from "@/components/ui/switch"
import FlashcardCard from "./flashcardCard"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import AddWordDialog from "./AddWordDialog"
import { Flashcard } from "@/lib/types"



export default function FlashcardArea({ level, list }: { level: "初心者" | "中級" | "上級" | null, list: string | null}) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [showShuffleDialog, setShowShuffleDialog] = useState(false)
  const [originalCards, setOriginalCards] = useState<Flashcard[]>([])
  const [showAddWordDialog, setShowAddWordDialog] = useState(false)
  const [vocabData, setVocabData] = useState<Record<string, Flashcard[]>>({})




  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    setCurrentIndex(0)
  }
  
  useEffect(() => {
    if (!level && !list) return
  
    if (level) {
      fetch("/data/VocabularyAll.json")
        .then((res) => res.json())
        .then((data) => {
          if (data[level]) {
            const selectedCards: Flashcard[] = data[level].map((item: any) => ({
              id: String(item.id),
              korean: item.korean,
              japanese: item.japanese,
            }))
            setCards(selectedCards)
            setFilteredCards(selectedCards)
            setCurrentIndex(0)
          }
        })
    }
  
    if (list && !level) {
      setCards([])
      setFilteredCards([])
      setCurrentIndex(0)
    }
  }, [level, list])
  

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
    setOriginalCards(finalResults)
  }, [searchKeyword, cards,favorites, showFavoritesOnly])

  useEffect(() => {
    console.log("単語帳の中身:", vocabData)
  }, [vocabData])
  

  const handleNext = () => {
    setDirection("next")
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length)
  }
  
  const handlePrevious = () => {
    setDirection("prev")
    setCurrentIndex((prev) => {
      const prevIndex = (prev - 1 + filteredCards.length) % filteredCards.length
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

  const shuffleCards = () => {
    // filteredCardsの順番をシャッフル。originalCardsは絶対に変更しないこと。
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5)
    setFilteredCards(shuffled)
    setCurrentIndex(0)
  }

  const handleSaveWord = (korean: string, japanese: string) => {
    if (!list) return
  
    const newWord: Flashcard = {
      id: Date.now().toString(),
      korean,
      japanese,
    }
  
    setVocabData((prev) => {
      const updatedList = prev[list] ? [...prev[list], newWord] : [newWord]
      return {
        ...prev,
        [list]: updatedList,
      }
    })
  
    // UIにも反映させるためにcardsを更新
    setCards((prev) => [...prev, newWord])
    setFilteredCards((prev) => [...prev, newWord])
  }
 
  if (filteredCards.length > 0) {
    console.log("表示中の単語:", filteredCards.map(card => card.korean))
  }
  
  
  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar onSearch={handleSearch} />
      <AlertDialog open={showShuffleDialog} onOpenChange={setShowShuffleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>シャッフルしてもよろしいですか？</AlertDialogTitle>
            <AlertDialogDescription>シャッフルすると、カードの順番がランダムになります。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              shuffleCards()
              setShowShuffleDialog(false)
            }}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 mb-4">
          <Switch checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} />
          <span className="text-sm">お気に入りだけを表示</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-500 text-white">シャッフル</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowShuffleDialog(true)}>
                シャッフル
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setFilteredCards(originalCards)
                setCurrentIndex(0)
              }}>
                元の順番
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <Button
          className="mt-4 bg-green-600 text-white"
          onClick={() => setShowAddWordDialog(true)}
        >
          + 単語を追加
        </Button>

      </div>
      <AddWordDialog
        open={showAddWordDialog}
        onOpenChange={setShowAddWordDialog}
        onSave={handleSaveWord}
      />    
    </div>
    )
  }
