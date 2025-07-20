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
import type { Card as FlashCard } from "@/app/page"

interface EditCardDialogProps {
  card: FlashCard
  onUpdateCard: (card: FlashCard) => void
  onClose: () => void
}

export function EditCardDialog({ card, onUpdateCard, onClose }: EditCardDialogProps) {
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)

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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>Update the content of this flashcard.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="front">Front (Question)</Label>
              <Textarea id="front" value={front} onChange={(e) => setFront(e.target.value)} rows={3} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="back">Back (Answer)</Label>
              <Textarea id="back" value={back} onChange={(e) => setBack(e.target.value)} rows={3} required />
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
