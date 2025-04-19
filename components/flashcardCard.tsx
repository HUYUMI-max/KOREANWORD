import { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Flashcard } from "@/lib/types";
import { Trash2 } from "lucide-react"

interface FlashcardCardProps {
    card: Flashcard
    isFavorite: boolean
    onToggleFavorite: () => void
    onDelete: (wordId: string) => void
  }
  
export default function FlashcardCard({
  card, 
  isFavorite, 
  onToggleFavorite, 
  onDelete
}: FlashcardCardProps) {
    const [isFlipped, setIsFlipped] = useState(false)

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
      }

    return (
        <Card className="relative w-[300px] h-[200px]" onClick={handleFlip}>
                <button
                  onClick={(e) => {
                    e.stopPropagation() // ← 親の onClick（handleFlip）を止める
                    e.preventDefault()
                    onToggleFavorite()
                  }}
                  className="absolute top-2 right-2 z-10"
                >
                  {isFavorite ? "★" : "☆"}
                </button>
                <button
                  className="absolute top-2 right-10 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                  onClick={(e) => {
                    console.log("削除ボタンがクリックされました", { cardId: card.id });
                    e.stopPropagation() // ← 親の onClick（handleFlip）を止める
                    e.preventDefault()
                    onDelete(card.id)
                  }}
                  aria-label="単語を削除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6 }}
                      className="w-full h-full [transform-style:preserve-3d] pointer-events-none"
                    >
                      <div className="absolute w-full h-full flex items-center justify-center p-6 backface-hidden">
                        <h2 className="text-3xl font-bold text-center">{card.korean}</h2>
                      </div>
                      <div className="absolute w-full h-full flex items-center justify-center p-6 [transform:rotateY(180deg)] backface-hidden">
                        <h2 className="text-3xl font-bold text-center">{card.japanese}</h2>
                      </div>
                    </motion.div>
                  </Card>
    )
}
    
