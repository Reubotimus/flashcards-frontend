"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RotateCcw } from "lucide-react"
import type { Card as FlashCard } from "@/components/main-dashboard"
import * as flashcardService from "@/services/flashcard-service"

// Types
interface ReviewSessionProps {
  cards: FlashCard[]
  deckName: string
  onFinish: () => void // Updated: onFinish no longer needs to pass updated cards
  onBack: () => void
  userId: string
}

// Model and Controller Hook
const useReviewSession = ({ cards, onFinish, userId }: Pick<ReviewSessionProps, "cards" | "onFinish" | "userId">) => {
  // Model
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  // No longer need to track reviewedCards in local state, as updates are sent to the backend.

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + (showAnswer ? 0.5 : 0)) / cards.length) * 100

  // Controller
  const handleQuality = async (rating: flashcardService.Rating) => {
    if (!currentCard) return

    try {
      await flashcardService.reviewCard(userId, currentCard.deckId, currentCard.id, { rating })

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowAnswer(false)
      } else {
        onFinish() // All cards reviewed
      }
    } catch (error) {
      console.error("Failed to review card:", error)
      // Handle error appropriately
    }
  }

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setShowAnswer(false)
  }

  return {
    currentIndex,
    showAnswer,
    progress,
    currentCard,
    handleQuality,
    handleShowAnswer,
    handleRestart,
  }
}

// View
export function ReviewSession({ cards, deckName, onFinish, onBack, userId }: ReviewSessionProps) {
  const {
    currentIndex,
    showAnswer,
    progress,
    currentCard,
    handleQuality,
    handleShowAnswer,
    handleRestart,
  } = useReviewSession({ cards, onFinish, userId })

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>No cards to review in this session.</p>
        <Button onClick={onBack} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{deckName}</h1>
              <p className="text-sm text-muted-foreground">
                Card {currentIndex + 1} of {cards.length}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">{showAnswer ? "Answer" : "Question"}</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="text-lg leading-relaxed">{showAnswer ? currentCard.back : currentCard.front}</div>
            </CardContent>
          </Card>

          {!showAnswer ? (
            <div className="text-center">
              <Button onClick={handleShowAnswer} size="lg">
                Show Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">How well did you remember this?</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleQuality(flashcardService.Rating.Again)}
                  className="h-auto py-3 px-4 text-left"
                >
                  <div>
                    <div className="font-medium text-red-600">Again</div>
                    <div className="text-xs text-muted-foreground">Complete blackout</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuality(flashcardService.Rating.Hard)}
                  className="h-auto py-3 px-4 text-left"
                >
                  <div>
                    <div className="font-medium text-orange-600">Hard</div>
                    <div className="text-xs text-muted-foreground">Difficult to recall</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuality(flashcardService.Rating.Good)}
                  className="h-auto py-3 px-4 text-left"
                >
                  <div>
                    <div className="font-medium text-blue-600">Good</div>
                    <div className="text-xs text-muted-foreground">Recalled with effort</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuality(flashcardService.Rating.Easy)}
                  className="h-auto py-3 px-4 text-left"
                >
                  <div>
                    <div className="font-medium text-green-600">Easy</div>
                    <div className="text-xs text-muted-foreground">Perfect recall</div>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
