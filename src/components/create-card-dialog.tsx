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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface CreateCardDialogProps {
  onCreateCard: (front: string, back: string) => void
}

export function CreateCardDialog({ onCreateCard }: CreateCardDialogProps) {
  const [open, setOpen] = useState(false)
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (front.trim() && back.trim()) {
      onCreateCard(front.trim(), back.trim())
      setFront("")
      setBack("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Card</DialogTitle>
            <DialogDescription>Add a new flashcard to this deck.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="front">Front (Question)</Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Enter the question or prompt..."
                rows={3}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="back">Back (Answer)</Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Enter the answer or explanation..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
