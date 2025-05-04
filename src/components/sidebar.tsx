"use client"

import { useState } from "react"
import { useAuth }  from "@clerk/nextjs"
import useSWR from "swr"
import { FolderOpen, Plus, Trash2 } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { ScrollArea, ScrollBar } from "@/src/components/ui/scroll-area"
import NewVocabularyModal from "@/src/components/NewVocabularyModal"

import {
  createVocabularyFolder,
  deleteVocabularyFolder,
} from "@/src/lib/actions/folderActions"

interface SidebarProps {
  onSelectLevel: (level: "初心者" | "中級" | "上級") => void
  onSelectList: (name: string) => void
}

type Folder = {
  id: string
  name: string
  createdAt: any
}

const fetcher: (url: string) => Promise<Folder[]> = (url) =>
  fetch(url).then((res) => res.json())

export default function Sidebar({ onSelectLevel, onSelectList }: SidebarProps) {
  const { userId } = useAuth()

  const swrKey = userId ? "/api/folders" : null;

  const {
    data   : folders = [],                            // ★ fallbackData=[]
    error  ,
    mutate ,
  } = useSWR<Folder[]>(swrKey, fetcher, { fallbackData: [] })

  const folderList = folders
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreate = async (name: string) => {
    await createVocabularyFolder(name)
    mutate()
  }

  const handleDelete = async (folderName: string) => {
    if (!confirm(`「${folderName}」フォルダを削除しますか？`)) return
  
    try {
      await deleteVocabularyFolder(folderName)
  
      // キャッシュから手動で削除（再フェッチしない）
      mutate((prev) => prev?.filter((f) => f.name !== folderName), false)
    } catch (e) {
      alert("削除に失敗しました")
      console.error(e)
    }
  }
  
  return (
    <div className="hidden md:block w-60 border-r bg-background/80">
      {/* 上部：新規ボタン */}
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">単語帳</h2>
        <Button size="icon" variant="outline" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* レベル別プリセット */}
      <div className="px-4">
        <h3 className="mb-2 text-sm font-semibold">レベル別単語帳</h3>
        {["初心者", "中級", "上級"].map((lv) => (
          <Button
            key={lv}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onSelectLevel(lv as "初心者" | "中級" | "上級")}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            TOPIK ({lv})
          </Button>
        ))}
      </div>

      {/* マイ単語帳一覧 */}
      <div className="px-4 mt-4">
        <h3 className="mb-2 text-sm font-semibold">マイ単語帳</h3>
      </div>

      <ScrollArea className="px-4 h-[calc(100vh-220px)] pb-6">
        {error && (
          <p className="text-xs text-destructive mb-2">
            フォルダの取得に失敗しました
          </p>
        )}

        <div className="space-y-1">
          {folderList.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center justify-between rounded-md hover:bg-muted"
            >
              <Button
                variant="ghost"
                className="flex-1 justify-start"
                onClick={() => onSelectList(folder.name)}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                {folder.name}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(folder.name)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <ScrollBar />
      </ScrollArea>

      {/* 新規作成モーダル */}
      <NewVocabularyModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existingNames={folderList.map((f) => f.name)}
        onCreate={handleCreate}
      />
    </div>
  )
}
