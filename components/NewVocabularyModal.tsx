import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function NewVocabularyModal({ open, onOpenChange, onCreate }: { open: boolean, onOpenChange: (open: boolean) => void, onCreate: (name: string) => void }) {
  const [name, setName] = useState("")

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim())
      setName("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新しい単語帳を作成</DialogTitle>
        </DialogHeader>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="単語帳名を入力"
          className="mt-4"
        />
        <DialogFooter>
          <Button onClick={handleCreate}>作成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
