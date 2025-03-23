"use client"

import{useState} from "react"
import{motion, AnimatePresence} from "framer-motion"
import{ChevronLeft, ChevronRight} from "lucide-react"
import { Button } from "@/components/ui/button"
import {Card} from "@/components/ui/card"

interface Flashcard {
  id:string
  korean:string
  japanese: string
  level: string
}

// サンプルデータ、あとでファイルを同期する
const sampleCards: Flashcard[] = [
  {id: "1", korean: "안녕하세요", japanese: "こんにちは", level: "TOPIK1"},
  {id: "2", korean: "감사합니다", japanese: "ありがとうございます", level: "TOPIK1"},
  {id: "3", korean: "사랑해요", japanese: "愛してます", level: "TOPIK1"},
]

export default function Home(){
  const [currentIndex,setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % sampleCards.length)
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + sampleCards.length) % sampleCards.length)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return(
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-4 mb-8">
          <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={sampleCards.length <= 1}
          >
            <ChevronLeft className="h-4 w-4"/>
          </Button>
          <AnimatePresence mode="wait">
            <motion.div
            key={currentIndex}
            initial={{opacity: 0, x: 100}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -100}}
            transition={{duration: 0.3}}
            className="perspective-1000">
              <Card 
              className="w-[300px] h-[200px] cursor-pointer bg-card"
              onClick={handleFlip}>
                <motion.div
                animate={{rotateY: isFlipped ? 180: 0}}
                transition={{duration: 0.6}}
                className="w-full h-full [transform-style:preserve-3d]"
                >
                <div className="absolute w-full h-full flex items-center justify-center p-6 backface-hidden">
                  <h2 className="text-3xl font-bold text-center">
                    {sampleCards[currentIndex].korean}
                  </h2>
                </div>
                <div className="absolute w-full h-full flex items-center justify-center p-6 [transform:rotateY(180deg)] backface-hidden">
                  <h2 className="text-3xl font-bold text-center">
                    {sampleCards[currentIndex].japanese}
                  </h2>
                </div>
                </motion.div>
              </Card>
            </motion.div>
          </AnimatePresence>
          <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={sampleCards.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          カードをクリックして裏返す
        </p>
      </div>
    </div>
  )
}