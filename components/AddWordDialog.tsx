"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface AddWordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (korean: string, japanese: string) => void
}

export default function AddWordDialog({
  open,
  onOpenChange,
  onSave,
}: AddWordDialogProps) {
  const [korean, setKorean] = useState("")
  const [japanese, setJapanese] = useState("")
  const [hasTranslated, setHasTranslated] = useState(false)

  const translateText = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    return `（${targetLang}に翻訳）${text}`
  }

  useEffect(() => {
    if (korean && !japanese && !hasTranslated) {
      translateText(korean, "ko", "ja").then((result) => {
        setJapanese(result)
        setHasTranslated(true)
      })
    }
  }, [korean])

  useEffect(() => {
    if (japanese && !korean && !hasTranslated) {
      translateText(japanese, "ja", "ko").then((result) => {
        setKorean(result)
        setHasTranslated(true)
      })
    }
  }, [japanese])

  useEffect(() => {
    if (open) {
      resetFields()
    }
  }, [open])

  const resetFields = () => {
    setKorean("")
    setJapanese("")
    setHasTranslated(false)
  }

  const handleSave = () => {
    if (korean.trim() && japanese.trim()) {
      onSave(korean.trim(), japanese.trim())
      onOpenChange(false)
    }
  }

  const handleSaveAndContinue = () => {
    if (korean.trim() && japanese.trim()) {
      onSave(korean.trim(), japanese.trim())
      resetFields()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>単語を追加</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            placeholder="韓国語"
            value={korean}
            onChange={(e) => setKorean(e.target.value)}
          />
          <Input
            placeholder="日本語"
            value={japanese}
            onChange={(e) => setJapanese(e.target.value)}
          />
        </div>
        <DialogFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleSaveAndContinue}
          >
            連続追加
          </Button>
          <Button
            className="bg-green-600 text-white"
            onClick={handleSave}
          >
            保存して閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
