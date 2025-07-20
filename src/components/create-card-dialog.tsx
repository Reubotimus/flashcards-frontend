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
  onCreateCard: (front: string, back: string) => Promise<void>
}

// Model
const useCreateCardDialogModel = () => {
  const [open, setOpen] = useState(false)
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  return {
    open,
    setOpen,
    front,
    setFront,
    back,
    setBack,
    isCreating,
    setIsCreating,
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
  const { front, setFront, back, setBack, setOpen, isCreating, setIsCreating } = model

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (front.trim() && back.trim() && !isCreating) {
      setIsCreating(true)
      try {
        await onCreateCard(front.trim(), back.trim())
        setFront("")
        setBack("")
        setOpen(false)
      } catch (error) {
        console.error("Failed to create card:", error)
        // Optionally, show an error message to the user
      } finally {
        setIsCreating(false)
      }
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
  const { open, setOpen, front, back, isCreating } = model
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
          <fieldset disabled={isCreating} className="grid gap-4 py-4">
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
          </fieldset>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={controller.handleCancel} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
