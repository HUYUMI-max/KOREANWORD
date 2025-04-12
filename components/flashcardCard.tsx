import { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Flashcard } from "@/lib/types";


interface FlashcardCardProps {
    card: Flashcard
    isFavorite: boolean
    onToggleFavorite: () => void
  }

  
export default function FlashcardCard({card, isFavorite, onToggleFavorite}: FlashcardCardProps) {
    const [isFlipped, setIsFlipped] = useState(false)

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
      }

    return (
        <div className="relative">
                
                <button
                  onClick={(e) => {
                    e.stopPropagation() // ← 親の onClick（handleFlip）を止める
                    onToggleFavorite()
                  }}
                  className="absolute top-2 right-2 z-10"
                >
                  {isFavorite ? "★" : "☆"}
                </button>

                  <Card className="w-[300px] h-[200px] cursor-pointer bg-card" onClick={handleFlip}>
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6 }}
                      className="w-full h-full [transform-style:preserve-3d]"
                    >
                      <div className="absolute w-full h-full flex items-center justify-center p-6 backface-hidden">
                        <h2 className="text-3xl font-bold text-center">{card.korean}</h2>
                      </div>
                      <div className="absolute w-full h-full flex items-center justify-center p-6 [transform:rotateY(180deg)] backface-hidden">
                        <h2 className="text-3xl font-bold text-center">{card.japanese}</h2>
                      </div>
                    </motion.div>
                  </Card>
                </div>
    )
    


}
    
