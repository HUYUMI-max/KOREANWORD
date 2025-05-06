import { Button } from "@/src/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type DirectionButtonProps = {
    handlePrevious: () => void
    handleNext: () => void
    filteredCards: any[]
}

export default function DirectionButton({handlePrevious, handleNext, filteredCards}: DirectionButtonProps) {
    

    return (
        <div className="flex items-center gap-4 mb-8">

            <Button variant="outline" size="icon" onClick={handlePrevious} disabled={filteredCards.length <= 1}>
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={handleNext} disabled={filteredCards.length <= 1}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>


    )
}

