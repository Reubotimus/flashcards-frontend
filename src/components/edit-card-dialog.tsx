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
  onUpdateCard: (card: FlashCard) => Promise<void>
  onClose: () => void
}

// Model
function useEditCardModel(card: FlashCard) {
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)
  const [isUpdating, setIsUpdating] = useState(false)

  return { front, setFront, back, setBack, isUpdating, setIsUpdating }
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
  isUpdating,
  setIsUpdating,
}: {
  card: FlashCard
  front: string
  back: string
  onUpdateCard: (card: FlashCard) => Promise<void>
  onClose: () => void
  setFront: (value: string) => void
  setBack: (value: string) => void
  isUpdating: boolean
  setIsUpdating: (value: boolean) => void
}) {
  const handleFrontChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFront(e.target.value)
  }

  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBack(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (front.trim() && back.trim() && !isUpdating) {
      setIsUpdating(true)
      try {
        await onUpdateCard({
          ...card,
          front: front.trim(),
          back: back.trim(),
        })
        onClose()
      } catch (error) {
        console.error("Failed to update card:", error)
      } finally {
        setIsUpdating(false)
      }
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
  const { front, setFront, back, setBack, isUpdating, setIsUpdating } =
    useEditCardModel(card)
  const { handleSubmit, handleFrontChange, handleBackChange } =
    useEditCardController({
      card,
      front,
      back,
      onUpdateCard,
      onClose,
      setFront,
      setBack,
      isUpdating,
      setIsUpdating,
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
          <fieldset disabled={isUpdating} className="grid gap-4 py-4">
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
          </fieldset>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
