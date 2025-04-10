import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface NewVocabularyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => void
  existingNames: string[]
}

export default function NewVocabularyModal({
  open,
  onOpenChange,
  onCreate,
  existingNames,
}: NewVocabularyModalProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const handleCreate = () => {
    const trimmed = name.trim()
    if (!trimmed) {
        setError("単語帳名を入力してください。")
        return
      }
  
      if (existingNames.includes(trimmed)) {
        setError("同じ名前の単語帳がすでに存在します。")
        return
      }
  
      // 正常なら作成
      onCreate(trimmed)
      setName("")
      setError("")
      onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新しい単語帳を作成</DialogTitle>
        </DialogHeader>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError("") // 入力変更でエラー消す
          }}
          placeholder="単語帳名を入力"
          className="mt-4"
        />
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        <DialogFooter>
          <Button onClick={handleCreate}>作成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

