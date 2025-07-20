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

// Types
interface CreateCardDialogProps {
  onCreateCard: (front: string, back: string) => void
}

// Model
const useCreateCardDialogModel = () => {
  const [open, setOpen] = useState(false)
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")

  return {
    open,
    setOpen,
    front,
    setFront,
    back,
    setBack,
  }
}

// Controller
const useCreateCardDialogController = ({
  model,
  onCreateCard,
}: {
  model: ReturnType<typeof useCreateCardDialogModel>
  onCreateCard: CreateCardDialogProps["onCreateCard"]
}) => {
  const { front, setFront, back, setBack, setOpen } = model

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (front.trim() && back.trim()) {
      onCreateCard(front.trim(), back.trim())
      setFront("")
      setBack("")
      setOpen(false)
    }
  }

  const handleFrontChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFront(e.target.value)
  }

  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBack(e.target.value)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return { handleSubmit, handleFrontChange, handleBackChange, handleCancel }
}

// View
export function CreateCardDialog({ onCreateCard }: CreateCardDialogProps) {
  const model = useCreateCardDialogModel()
  const { open, setOpen, front, back } = model
  const controller = useCreateCardDialogController({ model, onCreateCard })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={controller.handleSubmit}>
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
                onChange={controller.handleFrontChange}
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
                onChange={controller.handleBackChange}
                placeholder="Enter the answer or explanation..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={controller.handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Create Card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
