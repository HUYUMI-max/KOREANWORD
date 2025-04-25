"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SearchBar from "./searchBar"
import { Switch } from "@/components/ui/switch"
import FlashcardCard from "./flashcardCard"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import AddWordDialog from "./AddWordDialog"
import { Flashcard } from "@/lib/types"
import { doc, setDoc, collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { deleteWordFromFolder } from "@/lib/firestore"
import { useAuth } from "@clerk/nextjs" // 追加

export default function FlashcardArea({
  level,
  list,
}: {
  level: "初心者" | "中級" | "上級" | null
  list: string | null
}) {
  const { userId } = useAuth() // 追加

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

  // JSON からレベル別単語を取得
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
    // list（Firestore）は下の useEffect で処理
  }, [level, list])

  // 検索・お気に入りフィルタ
  useEffect(() => {
    const baseResults =
      searchKeyword === ""
        ? cards
        : cards.filter(
            (card) =>
              (typeof card.korean === "string" &&
                card.korean.includes(searchKeyword)) ||
              (typeof card.japanese === "string" &&
                card.japanese.includes(searchKeyword))
          )

    const finalResults = showFavoritesOnly
      ? baseResults.filter((card) => {
          const key = level ? `${level}-${card.id}` : `${list}-${card.id}`
          return favorites.includes(key)
        })
      : baseResults

    setFilteredCards(finalResults)
    setOriginalCards(finalResults)
  }, [
    searchKeyword,
    cards,
    favorites,
    showFavoritesOnly,
    level,
    list,
  ])

  // Firestore のリスト監視
  useEffect(() => {
    if (!list) return

    const unsubscribe = onSnapshot(
      collection(db, "vocabLists", list, "words"),
      (snapshot) => {
        const newCards = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Flashcard[]
        setCards(newCards)
        setFilteredCards(newCards)
      }
    )

    return () => unsubscribe()
  }, [list])

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
    if (!selectedCard || (!level && !list)) return

    const key = level ? `${level}-${selectedCard.id}` : `${list}-${selectedCard.id}`

    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    )
  }

  // 単語削除
  const handleDeleteWord = async (wordId: string) => {
    if (!list) {
      console.log("list が null のため削除できません")
      return
    }
    if (!userId) {
      console.error("userId が取得できません")
      return
    }
    if (confirm("この単語を本当に削除しますか？")) {
      try {
        await deleteWordFromFolder(userId, list, wordId) // 3 引数
        console.log("削除が成功しました")
      } catch (error) {
        console.error("削除中にエラーが発生しました:", error)
      }
    }
  }

  const safeIndex = Math.min(currentIndex, filteredCards.length - 1)
  const selectedCard = filteredCards[safeIndex]
  const isFavorite = selectedCard
    ? level
      ? favorites.includes(`${level}-${selectedCard.id}`)
      : list
      ? favorites.includes(`${list}-${selectedCard.id}`)
      : false
    : false

  const variants = {
    enter: (dir: "next" | "prev") => ({
      opacity: 0,
      x: dir === "next" ? 100 : -100,
    }),
    center: { opacity: 1, x: 0 },
    exit: (dir: "next" | "prev") => ({
      opacity: 0,
      x: dir === "next" ? -100 : 100,
    }),
  }

  const shuffleCards = () => {
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5)
    setFilteredCards(shuffled)
    setCurrentIndex(0)
  }

  const handleSaveWord = async (korean: string, japanese: string) => {
    if (!list) return

    const id = Date.now().toString()
    const newWord: Flashcard = { id, korean, japanese }

    try {
      const docRef = doc(db, "vocabLists", list, "words", id)
      await setDoc(docRef, newWord)
      console.log("Firestoreに保存完了")

      setCards((prev) => [...prev, newWord])
      setFilteredCards((prev) => [...prev, newWord])
    } catch (error) {
      console.error("Firestore保存エラー:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar onSearch={handleSearch} />

      {/* シャッフル確認ダイアログ */}
      <AlertDialog open={showShuffleDialog} onOpenChange={setShowShuffleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>シャッフルしてもよろしいですか？</AlertDialogTitle>
            <AlertDialogDescription>
              シャッフルすると、カードの順番がランダムになります。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                shuffleCards()
                setShowShuffleDialog(false)
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {/* お気に入りスイッチ */}
        <div className="flex items-center gap-2 mb-4">
          <Switch
            checked={showFavoritesOnly}
            onCheckedChange={setShowFavoritesOnly}
          />
          <span className="text-sm">お気に入りだけを表示</span>
        </div>

        {/* シャッフルメニュー */}
        <div className="flex items-center gap-2 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-500 text-white">シャッフル</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowShuffleDialog(true)}>
                シャッフル
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setFilteredCards(originalCards)
                  setCurrentIndex(0)
                }}
              >
                元の順番
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* カード表示 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={filteredCards.length <= 1}
          >
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
                  onDelete={handleDeleteWord}
                />
              </motion.div>
            </AnimatePresence>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={filteredCards.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          カードをクリックして裏返す
        </p>

        <Button
          className="mt-4 bg-green-600 text-white"
          onClick={() => setShowAddWordDialog(true)}
        >
          + 単語を追加
        </Button>
      </div>

      {/* 単語追加ダイアログ */}
      <AddWordDialog
        open={showAddWordDialog}
        onOpenChange={setShowAddWordDialog}
        onSave={handleSaveWord}
        list={list}
      />
    </div>
  )
}
