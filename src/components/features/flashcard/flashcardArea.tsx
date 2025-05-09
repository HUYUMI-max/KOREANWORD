"use client"

import { useCallback, useEffect, useMemo, useState, useReducer, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import useSWR from "swr"
import debounce from "lodash.debounce"

import { addWordToFolder, fetchWordsInFolder } from "@/src/lib/actions/wordActions"
import { deleteWordFromFolder } from "@/src/lib/actions/firestore"

import FlashcardCard from "../../common/flashcardCard"
import AddWordDialog from "./AddWordDialog"
import SearchBar     from "./searchBar"
import { Button }    from "@/src/components/ui/button"
// import { Switch } from "@/components/ui/switch"   // ★お気に入りを戻す時だけ有効に
import {
  DropdownMenu, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuItem,
} from "@/src/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/src/components/ui/alert-dialog"

import { Flashcard } from "@/src/types/flashcard"

type Props = {
  level: "初心者" | "中級" | "上級" | null
  list : string | null
}

/* ------------ 状態の型定義 ------------ */
type FlashcardState = {
  cards: Flashcard[]
  currentIndex: number
  isShuffled: boolean
  originalOrder: number[]  // シャッフル前の順序を保持
  isUpdating: boolean
  shuffledIndices: number[] // シャッフル時の順序を保持
}

type StateAction = 
  | { type: 'TOGGLE_FAVORITE'; wordId: string; isFavorite: boolean }
  | { type: 'SHUFFLE' }
  | { type: 'RESET_ORDER' }
  | { type: 'SET_INDEX'; index: number }
  | { type: 'SET_CARDS'; cards: Flashcard[]; currentIndex?: number; isShuffled?: boolean; shuffledIndices?: number[] }
  | { type: 'SET_UPDATING'; isUpdating: boolean }

/* ------------ 状態更新関数 ------------ */
function flashcardReducer(state: FlashcardState, action: StateAction): FlashcardState {
  switch (action.type) {
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        cards: state.cards.map(card =>
          card.id === action.wordId
            ? { ...card, isFavorite: action.isFavorite }
            : card
        ),
        // シャッフル状態を維持
        ...(state.isShuffled && {
          shuffledIndices: state.shuffledIndices
        })
      }
    case 'SHUFFLE':
      const shuffledIndices = Array.from({ length: state.cards.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
      return {
        ...state,
        cards: shuffledIndices.map(i => state.cards[i]),
        originalOrder: state.cards.map((_, i) => i),
        isShuffled: true,
        shuffledIndices
      }
    case 'RESET_ORDER':
      return {
        ...state,
        cards: state.originalOrder.map(i => state.cards[i]),
        isShuffled: false,
        shuffledIndices: []
      }
    case 'SET_INDEX':
      return {
        ...state,
        currentIndex: action.index
      }
    case 'SET_CARDS':
      return {
        ...state,
        cards: action.cards ?? [],
        currentIndex: typeof action.currentIndex === 'number' ? action.currentIndex : state.currentIndex,
        isShuffled: typeof action.isShuffled === 'boolean' ? action.isShuffled : state.isShuffled,
        originalOrder: action.cards ? action.cards.map((_, i) => i) : state.originalOrder,
        shuffledIndices: action.shuffledIndices ?? state.shuffledIndices,
      }
    case 'SET_UPDATING':
      return {
        ...state,
        isUpdating: action.isUpdating
      }
    default:
      return state
  }
}

export default function FlashcardArea({ level, list }: Props) {
  const { userId } = useAuth()

  /* ------------ 状態管理 ------------ */
  const [state, dispatch] = useReducer(flashcardReducer, {
    cards: [],
    currentIndex: 0,
    isShuffled: false,
    originalOrder: [],
    isUpdating: false,
    shuffledIndices: []
  })

  // --- 追加: 現在のカードIDとシャッフル状態をuseRefで保持 ---
  const currentCardIdRef = useRef<string | undefined>(undefined)
  const isShuffledRef = useRef<boolean>(false)
  const shuffledIndicesRef = useRef<number[]>([])

  const [keyword, setKeyword] = useState("")
  const [dir, setDir] = useState<"next"|"prev">("next")
  const [openShuffle, setOpenShuffle] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selected, setSelected] = useState<Flashcard | null>(null)

  /* ------------ レベル別プリセット ------------ */
  useEffect(() => {
    if (!level) return
    ;(async () => {
      const json = await fetch("/data/VocabularyAll.json").then(r => r.json())
      const favorites = JSON.parse(localStorage.getItem(`favorites-${level}`) || '{}')
      const arr: Flashcard[] = json[level].map((v: any) => ({
        id: String(v.id),
        korean: v.korean,
        japanese: v.japanese,
        isFavorite: favorites[v.id] || false
      }))
      dispatch({ type: 'SET_CARDS', cards: arr })
    })()
  }, [level])

  /* ------------ SWR (list モード) ------------ */
  const swrKey = list ? `/api/folders/${encodeURIComponent(list)}/words` : null

  const { data: words = [], mutate } = useSWR(
    swrKey,
    () => fetchWordsInFolder(list!),
    { 
      fallbackData: [],
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000
    }
  )

  useEffect(() => {
    if (list) {
      const isSame =
        state.cards.length === words.length &&
        state.cards.every((c, i) => c.id === words[i]?.id)
  
      if (!isSame) {
        dispatch({ type: 'SET_CARDS', cards: words })
      }
    }
  }, [words, list])

  /* ------------ 検索フィルタを useMemo で派生させる ------------ */
  const filteredCards = useMemo(() => 
    showFavoritesOnly 
      ? state.cards.filter(card => card.isFavorite)
      : state.cards,
    [state.cards, showFavoritesOnly]
  )

  /* index が範囲外にならないよう補正 */
  useEffect(() => {
    if (state.currentIndex >= filteredCards.length) {
      dispatch({ type: 'SET_INDEX', index: 0 })
    }
  }, [filteredCards.length, state.currentIndex])

  /* ------------ CRUD ------------ */
  const handleSaveWord = async (ko: string, ja: string) => {
    if (!list) return
    const tmpId = crypto.randomUUID()
    mutate((prev: Flashcard[] = []) => [...prev, { id: tmpId, korean: ko, japanese: ja }], false)

    try {
      const { id } = await addWordToFolder(list, { korean: ko, japanese: ja })
      mutate((prev: Flashcard[] = []) =>
        prev.map(w => w.id === tmpId ? { ...w, id } : w),
        { revalidate:true }
      )
    } catch (e) {
      console.error(e)
      mutate((prev?: Flashcard[]) => prev?.filter(w => w.id !== tmpId) ?? [], false)
      alert("保存に失敗しました")
    }
  }

  const handleDeleteWord = async (wordId: string) => {
    if (!userId || !list) return
    if (!confirm("この単語を本当に削除しますか？")) return
    try {
      await deleteWordFromFolder(userId, list, wordId)
      mutate()
    } catch (e) {
      console.error(e); alert("削除に失敗しました")
    }
  }

  /* ------------ お気に入り ------------ */
  const handleToggleFavorite = async (wordId: string, currentFavorite: boolean) => {
    if (level) {
      // レベルモードの場合、ローカルの状態を更新
      dispatch({ type: 'TOGGLE_FAVORITE', wordId, isFavorite: !currentFavorite })
      // localStorageに保存
      const favorites = JSON.parse(localStorage.getItem(`favorites-${level}`) || '{}')
      favorites[wordId] = !currentFavorite
      localStorage.setItem(`favorites-${level}`, JSON.stringify(favorites))
      return
    }

    if (!list) return

    try {
      dispatch({ type: 'SET_UPDATING', isUpdating: true })
      const newFavoriteState = !currentFavorite
      // --- 追加: 現在のカードIDとシャッフル状態をrefに保存 ---
      currentCardIdRef.current = state.cards[state.currentIndex]?.id
      isShuffledRef.current = state.isShuffled
      shuffledIndicesRef.current = state.shuffledIndices

      // デバッグログ: 楽観的UI更新前
      console.log('[お気に入り] 楽観的UI前', {
        cards: state.cards,
        shuffledIndices: state.shuffledIndices,
        currentIndex: state.currentIndex,
        isShuffled: state.isShuffled
      })
      // 1. 楽観的UI更新（シャッフル状態を維持）
      dispatch({ type: 'TOGGLE_FAVORITE', wordId, isFavorite: newFavoriteState })

      // デバッグログ: APIリクエスト前
      console.log('[お気に入り] APIリクエスト前', {
        cards: state.cards,
        shuffledIndices: state.shuffledIndices,
        currentIndex: state.currentIndex,
        isShuffled: state.isShuffled
      })

      // 2. APIリクエスト
      const response = await fetch(
        `/api/folders/${encodeURIComponent(list)}/words/${encodeURIComponent(wordId)}/favorite`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite: newFavoriteState }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update favorite status')
      }

      // 3. mutate後のcards配列で、refの値を使って状態を復元
      const responseJson = await response.json();
      let updatedWords: Flashcard[] = responseJson.words ?? state.cards;
      // UI上の順序（state.cards）にIDで並び替え
      const prevOrder = state.cards.map(card => card.id);
      updatedWords = prevOrder
        .map(id => updatedWords.find((w: Flashcard) => w.id === id))
        .filter((w): w is Flashcard => !!w);
      const currentCardId = currentCardIdRef.current
      const isShuffled = isShuffledRef.current
      const shuffledIndices = shuffledIndicesRef.current
      if (isShuffled && shuffledIndices.length > 0) {
        const safeShuffledCards = shuffledIndices
          .map(i => updatedWords[i])
          .filter((card: Flashcard | undefined): card is Flashcard => card !== undefined)
        const newIndex = safeShuffledCards.findIndex((card: Flashcard) => card?.id === currentCardId)
        dispatch({
          type: 'SET_CARDS',
          cards: safeShuffledCards,
          currentIndex: newIndex >= 0 ? newIndex : 0,
          isShuffled: true,
          shuffledIndices: shuffledIndices,
        })
      } else {
        const newIndex = updatedWords.findIndex((card: Flashcard) => card?.id === currentCardId)
        dispatch({
          type: 'SET_CARDS',
          cards: updatedWords,
          currentIndex: newIndex >= 0 ? newIndex : 0,
          isShuffled: false,
          shuffledIndices: [],
        })
      }
    } catch (e) {
      console.error("お気に入り更新失敗:", e)
      alert("お気に入りの更新に失敗しました")
      mutate()
    } finally {
      dispatch({ type: 'SET_UPDATING', isUpdating: false })
    }
  }

  /* ------------ ナビゲーション ------------ */
  const next = () => { 
    setDir("next")
    dispatch({ type: 'SET_INDEX', index: (state.currentIndex + 1) % filteredCards.length })
  }
  
  const prev = () => { 
    setDir("prev")
    dispatch({ type: 'SET_INDEX', index: (state.currentIndex - 1 + filteredCards.length) % filteredCards.length })
  }
  
  const shuffle = () => {
    dispatch({ type: 'SHUFFLE' })
  }

  /* ------------ 検索ハンドラ（debounce） ------------ */
  // 依存を空にすることで関数は 1 度だけ生成
  const handleSearch = useCallback(
    debounce((kw: string) => setKeyword(kw), 250),
    []
  )

  const handleResetOrder = () => {
    // 現在表示中のカードIDを取得
    const currentCardId = state.cards[state.currentIndex]?.id;
    // 元の順序に戻した配列を作成
    const resetCards = state.originalOrder.map(i => state.cards[i]);
    // 新しい配列でのインデックスを再計算
    const newIndex = resetCards.findIndex((card: Flashcard) => card?.id === currentCardId);
    dispatch({
      type: 'SET_CARDS',
      cards: resetCards,
      currentIndex: newIndex >= 0 ? newIndex : 0,
      isShuffled: false,
      shuffledIndices: [],
    });
  }

  /* ------------ JSX ------------ */
  const selectedCard = filteredCards[state.currentIndex] ?? null
  const variants = {
    enter :(d:"next"|"prev") => ({ opacity:0, x:d==="next"? 100:-100 }),
    center:                   { opacity:1, x:0 },
    exit  :(d:"next"|"prev") => ({ opacity:0, x:d==="next"?-100: 100 }),
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar onSearch={handleSearch} />

      {/* --- ドロップダウン / シャッフル --- */}
      <div className="flex items-center gap-2 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-blue-500 text-white">シャッフル</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setOpenShuffle(true)}>シャッフル</DropdownMenuItem>
            <DropdownMenuItem onClick={handleResetOrder}>元の順番</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* --- お気に入りフィルターボタン --- */}
      <button
        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        className={`px-4 py-2 rounded-full transition-colors ${
          showFavoritesOnly 
            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        {showFavoritesOnly ? '★ お気に入り表示中' : '☆ すべて表示'}
      </button>

      {/* --- カード --- */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" disabled={filteredCards.length<=1} onClick={prev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {selectedCard && (
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={selectedCard.id}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration:0.3 }}
              className="perspective-1000"
            >
              <FlashcardCard
                card={selectedCard}
                onDelete={handleDeleteWord}
                isFavorite={selectedCard.isFavorite ?? false}
                onToggleFavorite={() => selectedCard && handleToggleFavorite(selectedCard.id, selectedCard.isFavorite ?? false)}
              />
            </motion.div>
          </AnimatePresence>
        )}

        <Button variant="outline" size="icon" disabled={filteredCards.length<=1} onClick={next}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">カードをクリックして裏返す</p>

      <Button
        className="mt-4 bg-green-600 text-white"
        onClick={() => setOpenAdd(true)}
      >
        + 単語を追加
      </Button>

      {/* --- 追加ダイアログ / シャッフル確認 --- */}
      <AddWordDialog open={openAdd}  onOpenChange={setOpenAdd}  onSave={handleSaveWord} list={list} />
      <AlertDialog   open={openShuffle} onOpenChange={setOpenShuffle}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>シャッフルしてもよろしいですか？</AlertDialogTitle>
            <AlertDialogDescription>カードの順番がランダムになります。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={() => { shuffle(); setOpenShuffle(false) }}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
