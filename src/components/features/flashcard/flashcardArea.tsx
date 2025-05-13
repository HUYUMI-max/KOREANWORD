"use client"

import { useCallback, useEffect, useMemo, useState, useReducer, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, Loader2, Menu } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import useSWR from "swr"
import debounce from "lodash.debounce"
import { Card } from "@/src/components/ui/card"
import * as Dialog from "@/src/components/ui/dialog"
import Sidebar from "@/src/components/layouts/sidebar"

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
  onSelectLevel: (level: "初心者" | "中級" | "上級") => void
  onSelectList: (name: string) => void
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

export default function FlashcardArea({ level, list, onSelectLevel, onSelectList }: Props) {
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
  const [isAdding, setIsAdding] = useState(false)  // 追加: 単語追加中の状態
  const [deletingId, setDeletingId] = useState<string | null>(null)  // 追加: 削除中の単語ID
  const [drawerOpen, setDrawerOpen] = useState(false)

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
    setIsAdding(true)
    const tmpId = crypto.randomUUID()
    
    try {
      // 人工的な遅延を追加（1.5秒）
      await new Promise(resolve => setTimeout(resolve, 1500))
      const { id } = await addWordToFolder(list, { korean: ko, japanese: ja })
      
      // mutateの呼び出し方を修正
      await mutate(
        async (currentData: Flashcard[] = []) => {
          const newWord = { id, korean: ko, japanese: ja }
          return [...currentData, newWord]
        },
        { revalidate: false }  // 即時反映のため、revalidateはfalseに
      )
    } catch (e) {
      console.error(e)
      alert("保存に失敗しました")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteWord = async (wordId: string) => {
    if (!userId || !list) return
    if (!confirm("この単語を本当に削除しますか？")) return
    setDeletingId(wordId)  // 削除開始
    try {
      await deleteWordFromFolder(userId, list, wordId)
      mutate()
    } catch (e) {
      console.error(e); alert("削除に失敗しました")
    } finally {
      setDeletingId(null)  // 削除完了
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
      {/* --- モバイル用ハンバーガーメニュー --- */}
      <div className="sm:hidden flex items-center mb-4">
        <button
          className="p-2 rounded-md border border-gray-300 bg-white dark:bg-gray-800"
          onClick={() => setDrawerOpen(true)}
          aria-label="メニューを開く"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="ml-3 font-bold text-lg">単語帳フォルダ</span>
      </div>
      {/* --- Drawer --- */}
      <Dialog.Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.DialogContent className="p-0 max-w-xs w-full bg-white dark:bg-gray-900">
          <Dialog.DialogTitle className="sr-only">フォルダメニュー</Dialog.DialogTitle>
          <div className="h-screen overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Sidebar
              mobile
              onSelectLevel={(lv) => { onSelectLevel(lv); setDrawerOpen(false); }}
              onSelectList={(name) => { onSelectList(name); setDrawerOpen(false); }}
            />
          </div>
        </Dialog.DialogContent>
      </Dialog.Dialog>

      <SearchBar onSearch={handleSearch} />

      {/* --- シャッフルボタン（主操作） --- */}
      <div className="w-full mb-4">
        <Button
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 text-lg shadow-sm transition-colors dark:bg-indigo-800 dark:hover:bg-indigo-900"
          onClick={() => setOpenShuffle(true)}
        >
          🔄 シャッフル
        </Button>
      </div>

      {/* --- フィルタ切替（すべて表示／お気に入りのみ） --- */}
      <div className="flex gap-2 w-full mb-6">
        <button
          onClick={() => setShowFavoritesOnly(false)}
          className={`flex-1 btn-outline px-4 py-2 rounded-full border transition-colors font-medium
            ${!showFavoritesOnly
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
              : 'bg-muted/80 hover:bg-muted border-gray-300 text-gray-700 dark:bg-muted/60 dark:hover:bg-muted dark:text-gray-200'}`}
        >
          すべて表示
        </button>
        <button
          onClick={() => setShowFavoritesOnly(true)}
          className={`flex-1 btn-outline px-4 py-2 rounded-full border transition-colors font-medium
            ${showFavoritesOnly
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
              : 'bg-muted/80 hover:bg-muted border-gray-300 text-gray-700 dark:bg-muted/60 dark:hover:bg-muted dark:text-gray-200'}`}
        >
          ★ お気に入りのみ
        </button>
      </div>

      {/* --- カード --- */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-4 mb-8 h-[200px] sm:h-[200px] w-full justify-center">
          <Button
            variant="ghost"
            size="icon"
            disabled={filteredCards.length<=1}
            onClick={prev}
            className="rounded-full border border-gray-300 hover:bg-gray-100 transition-colors self-center"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {!list && !level ? (
            <Card className="w-[300px] h-[200px] bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center
              sm:w-[300px] sm:h-[200px] w-full max-w-xs h-[180px] px-2 py-4 text-2xl sm:text-base p-6 sm:p-4"
            >
              <h3 className="text-2xl sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                フォルダを選択してください
              </h3>
              <p className="text-base sm:text-sm text-gray-500 dark:text-gray-400">
                サイドバーから単語フォルダを選んでください
              </p>
            </Card>
          ) : filteredCards.length === 0 ? (
            <Card className="w-[300px] h-[200px] bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center
              sm:w-[300px] sm:h-[200px] w-full max-w-xs h-[180px] px-2 py-4 text-2xl sm:text-base p-6 sm:p-4"
            >
              <h3 className="text-2xl sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                単語がありません
              </h3>
              <p className="text-base sm:text-sm text-gray-500 dark:text-gray-400">
                {showFavoritesOnly 
                  ? "お気に入りの単語がありません"
                  : "右下の＋ボタンから単語を追加してください"
                }
              </p>
            </Card>
          ) : selectedCard && (
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
                <div className="sm:w-[300px] sm:h-[200px] w-full max-w-xs h-[180px] px-2 py-4 text-2xl sm:text-base p-6 sm:p-4">
                  <FlashcardCard
                    card={selectedCard}
                    onDelete={handleDeleteWord}
                    isFavorite={selectedCard.isFavorite ?? false}
                    onToggleFavorite={() => selectedCard && handleToggleFavorite(selectedCard.id, selectedCard.isFavorite ?? false)}
                    isUpdating={state.isUpdating}
                    isDeleting={deletingId === selectedCard.id}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          <Button
            variant="ghost"
            size="icon"
            disabled={filteredCards.length<=1}
            onClick={next}
            className="rounded-full border border-gray-300 hover:bg-gray-100 transition-colors self-center"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-6 mb-4">
        {filteredCards.length === 0 
          ? "右下の＋ボタンをクリックして単語を追加してください"
          : "カードをクリックして裏返す"
        }
      </p>

      {/* --- 追加ダイアログ / シャッフル確認 --- */}
      <AddWordDialog 
        open={openAdd}  
        onOpenChange={setOpenAdd}  
        onSave={handleSaveWord} 
        list={list}
        isAdding={isAdding}  // 追加: ローディング状態を渡す
      />
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

      {/* 右下固定のFAB */}
      <button
        onClick={() => setOpenAdd(true)}
        disabled={isAdding}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-emerald-500 text-white shadow-2xl w-20 h-20 flex items-center justify-center text-4xl hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus:ring-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="単語を追加"
      >
        {isAdding ? (
          <Loader2 className="h-10 w-10 animate-spin" />
        ) : (
          <Plus size={44} />
        )}
      </button>
    </div>
  )
}
