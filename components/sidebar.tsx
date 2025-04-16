"use client"

import { FolderOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import NewVocabularyModal from "@/components/NewVocabularyModal"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createVocabularyFolder } from "@/lib/firestore"


interface SidebarProps {
  onSelectLevel: (level: "初心者" | "中級" | "上級") => void;
  onSelectList: (listName: string) => void
}

export default function Sidebar({onSelectLevel, onSelectList}: SidebarProps){
  const [vocabLists, setVocabLists] = useState<string[]>(["初心者", "中級", "上級"])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [folderList, setFolderList] = useState<string[]>([])

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
          <h3 className="mb-2 text-sm font-semibold">
            マイ単語帳
          </h3>
          <div className="space-y-1">

          {folderList.map((name) => (
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
          ))}


            {vocabLists.slice(3).map((list, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onSelectList(list)
                }}
              >
              <FolderOpen className="mr-2 h-4 w-4" />
              {list}
            </Button>
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