"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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

export default function FlashcardArea({ level, list }: Props) {
  const { userId } = useAuth()

  /* ------------ 原データ ------------ */
  const [cards , setCards ] = useState<Flashcard[]>([])
  const [keyword, setKeyword] = useState("")
  const [index  , setIndex  ] = useState(0)
  const [dir    , setDir    ] = useState<"next"|"prev">("next")
  const [openShuffle , setOpenShuffle ] = useState(false)
  const [openAdd, setOpenAdd]       = useState(false)

  /* ------------ レベル別プリセット ------------ */
  useEffect(() => {
    if (!level) return            // list モードのときは読み込まない
    ;(async () => {
      const json = await fetch("/data/VocabularyAll.json").then(r => r.json())
      const arr : Flashcard[] = json[level].map((v: any) => ({
        id:String(v.id), korean:v.korean, japanese:v.japanese,
      }))
      setCards(arr); setIndex(0)
    })()
  }, [level])

  /* ------------ SWR (list モード) ------------ */
  const swrKey = list ? `/api/folders/${encodeURIComponent(list)}/words` : null

  const { data: words = [], mutate } = useSWR(
    swrKey,
    () => fetchWordsInFolder(list!),   // list !== null のときだけ
    { fallbackData: [] }
  )

  /* list が選択されているときだけ cards を置き換え */
  useEffect(() => {
    if (list) {
      const isSame =
        cards.length === words.length &&
        cards.every((c, i) => c.id === words[i]?.id);
  
      if (!isSame) {
        setCards(words);
        setIndex(0);
      }
    }
  }, [words, list]);

  /* ------------ 検索フィルタを useMemo で派生させる ------------ */
  const filteredCards = useMemo(() => {
    if (!keyword) return cards
    return cards.filter(c =>
      c.korean?.includes(keyword) || c.japanese?.includes(keyword)
    )
  }, [cards, keyword])

  /* index が範囲外にならないよう補正 */
  useEffect(() => {
    if (index >= filteredCards.length) setIndex(0)
  }, [filteredCards.length, index])

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

  /* ------------ ナビゲーション ------------ */
  const next = () => { setDir("next"); setIndex(i => (i + 1) % filteredCards.length) }
  const prev = () => { setDir("prev"); setIndex(i => (i - 1 + filteredCards.length) % filteredCards.length) }
  const shuffle = () => {
    setIndex(0);
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
  };


  /* ------------ 検索ハンドラ（debounce） ------------ */
  // 依存を空にすることで関数は 1 度だけ生成
  const handleSearch = useCallback(
    debounce((kw: string) => setKeyword(kw), 250),
    []
  )

  /* ------------ JSX ------------ */
  const selected = filteredCards[index] ?? null
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
            <DropdownMenuItem onClick={() => setIndex(0)}>元の順番</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* --- カード --- */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" disabled={filteredCards.length<=1} onClick={prev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {selected && (
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={selected.id}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration:0.3 }}
              className="perspective-1000"
            >
              <FlashcardCard
                card={selected}
                onDelete={handleDeleteWord}
                /* isFavorite / onToggleFavorite は未使用なので渡さない */
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
