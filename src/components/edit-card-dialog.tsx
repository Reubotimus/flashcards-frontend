"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Card as FlashCard } from "@/components/main-dashboard"

// Types
interface EditCardDialogProps {
  card: FlashCard
  onUpdateCard: (card: FlashCard) => void
  onClose: () => void
}

// Model
function useEditCardModel(card: FlashCard) {
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)

  return { front, setFront, back, setBack }
}

// Controller
function useEditCardController({
  card,
  front,
  back,
  onUpdateCard,
  onClose,
  setFront,
  setBack,
}: {
  card: FlashCard
  front: string
  back: string
  onUpdateCard: (card: FlashCard) => void
  onClose: () => void
  setFront: (value: string) => void
  setBack: (value: string) => void
}) {
  const handleFrontChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFront(e.target.value)
  }

  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBack(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (front.trim() && back.trim()) {
      onUpdateCard({
        ...card,
        front: front.trim(),
        back: back.trim(),
      })
      onClose()
    }
  }

  return { handleSubmit, handleFrontChange, handleBackChange }
}

// View
export function EditCardDialog({
  card,
  onUpdateCard,
  onClose,
}: EditCardDialogProps) {
  const { front, setFront, back, setBack } = useEditCardModel(card)
  const { handleSubmit, handleFrontChange, handleBackChange } =
    useEditCardController({
      card,
      front,
      back,
      onUpdateCard,
      onClose,
      setFront,
      setBack,
    })

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update the content of this flashcard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="front">Front (Question)</Label>
              <Textarea
                id="front"
                value={front}
                onChange={handleFrontChange}
                rows={3}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="back">Back (Answer)</Label>
              <Textarea
                id="back"
                value={back}
                onChange={handleBackChange}
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
