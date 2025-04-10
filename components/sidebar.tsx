"use client"

import { FolderOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area"
import { useState } from "react"
import NewVocabularyModal from "@/components/NewVocabularyModal"


interface SidebarProps {
  onSelectLevel: (level: "初心者" | "中級" | "上級") => void;
}

export default function Sidebar({onSelectLevel}: SidebarProps){
  const [vocabLists, setVocabLists] = useState<string[]>(["初級", "中級", "上級"])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newListName, setNewListName] = useState("")


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
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => {
                onSelectLevel("初心者")}}>
              <FolderOpen className="mr-2 h-4 w-4" />
              TOPIK 1-2級 (初級)
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => {
                onSelectLevel("中級")}}>
              <FolderOpen className="mr-2 h-4 w-4" />
              TOPIK 3-5級 (中級)
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => {
                onSelectLevel("上級")}}>
              <FolderOpen className="mr-2 h-4 w-4" />
              TOPIK 6級 (上級)
            </Button>
          </div>
        </div>
        <div className="px-4 py-2">
          <h3 className="mb-2 text-sm font-semibold">
            マイ単語帳
          </h3>
          <div className="space-y-1">
            {vocabLists.slice(3).map((list, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  console.log(`"${list}" 単語帳がクリックされました`)
                  // ここで選択した単語帳に切り替える処理が必要なら後で追加
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
        onCreate={(name) => {
          setVocabLists([...vocabLists, name])
        }}
        existingNames={vocabLists}
      />



    </div>
  )
}