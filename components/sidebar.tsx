"use client"

import { useEffect, useState } from "react"
import { FolderOpen, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import NewVocabularyModal from "@/components/NewVocabularyModal"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createVocabularyFolder } from "@/lib/firestore"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"



interface SidebarProps {
  onSelectLevel: (level: "初心者" | "中級" | "上級") => void;
  onSelectList: (listName: string) => void
}

export default function Sidebar({onSelectLevel, onSelectList}: SidebarProps){
  const [vocabLists, setVocabLists] = useState<string[]>(["初心者", "中級", "上級"])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [folderList, setFolderList] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const fetchFolders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "vocabLists"))
      console.log("snapshot.docs:", snapshot.docs)
  
      const folders = snapshot.docs.map(doc => doc.id)
      console.log("フォルダ名一覧:", folders)
  
      setFolderList(folders)
    } catch (error) {
      console.error("フォルダ取得エラー:", error)
    }
  }
  

  useEffect(() => {
    fetchFolders()
  }, [])

  const handleDeleteFolder = async (folderName: string) => {
    // 1. words サブコレクションの単語を全部削除
    const wordsSnapshot = await getDocs(collection(db, "vocabLists", folderName, "words"))
    const deletePromises = wordsSnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    // 2. 単語フォルダ自体を削除
    await deleteDoc(doc(db, "vocabLists", folderName))

    // 3. 再読み込み
    await fetchFolders()
  }



  return (
    <div className="hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block md:w-[240px]">
      <ScrollArea className="h-full py-6">
        <div className="px-4 py-2">
          <h2 className="mb-2 text-lg font-semibold">単語帳</h2>
          <Button variant="outline" className="w-full justify-start" onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        </div>
        <div className="px-4 py-2">
          <h3 className="mb-2 text-sm font-semibold">レベル別単語帳</h3>
          <div className="space-y-1">
          {["初心者", "中級", "上級"].map((level) => (
            <Button 
              key={level}
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => {
                onSelectLevel(level as "初心者" | "中級" | "上級")
              }}>
              <FolderOpen className="mr-2 h-4 w-4" />
              TOPIK ({level})
            </Button>
          ))}
          </div>
        </div>
        <div className="px-4 py-2">
          <h3 className="mb-2 text-sm font-semibold">マイ単語帳</h3>
          <div className="space-y-1">
            {folderList.map((name) => (
            <div key={name} className="flex items-center justify-between">
              <Button
                key={name}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                onSelectList(name)
                }}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                {name}
            </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        単語フォルダ「{deleteTarget}」とその中の単語すべてが削除されます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (deleteTarget) handleDeleteFolder(deleteTarget)
                        }}
                      >
                        削除する
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                </div>
          ))}

          </div>
        </div>
        <ScrollBar/>
      </ScrollArea>
      <NewVocabularyModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={async (name) => {
          await createVocabularyFolder(name)
          await fetchFolders()
        }}
        existingNames={vocabLists}
      />
    </div>
  )
}