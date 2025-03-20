"use client"

import { FolderOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area"

export default function Sidebar() {
  return (
    <div className="hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block md:w-[240px]">
      <ScrollArea className="h-full py-6">
        <div className="px-4 py-2">
          <h2 className="mb-2 text-lg font-semibold">単語帳</h2>
          <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        </div>
        <div className="px-4 py-2">
          <h3 className="mb-2 text-sm font-semibold">レベル別単語帳</h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
              <FolderOpen className="mr-2 h-4 w-4" />
              TOPIK 1-2級 (初級)
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
              <FolderOpen className="mr-2 h-4 w-4" />
              TOPIK 3-4級 (中級)
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
              <FolderOpen className="mr-2 h-4 w-4" />
              TOPIK 5-6級 (上級)
            </Button>
          </div>
        </div>
        <div className="px-4 py-2">
          <h3 className="mb-2 text-sm font-semibold">マイ単語帳</h3>
          <div className="space-y-1">
            {/* カスタム単語帳がここに表示されます */}
          </div>
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  )
}