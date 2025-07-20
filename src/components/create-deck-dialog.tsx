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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

// Types
interface CreateDeckDialogProps {
  onCreateDeck: (name: string, description: string) => void
}

// Model & Controller
function useCreateDeckDialogController({
  onCreateDeck,
}: {
  onCreateDeck: (name: string, description: string) => void
}) {
  // Model
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  // Controller
  const handleOpenChange = (value: boolean) => {
    setOpen(value)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreateDeck(name.trim(), description.trim())
      setName("")
      setDescription("")
      setOpen(false)
    }
  }

  return {
    open,
    name,
    description,
    handleOpenChange,
    handleNameChange,
    handleDescriptionChange,
    handleCancel,
    handleSubmit,
  }
}

// View
export function CreateDeckDialog({ onCreateDeck }: CreateDeckDialogProps) {
  const {
    open,
    name,
    description,
    handleOpenChange,
    handleNameChange,
    handleDescriptionChange,
    handleCancel,
    handleSubmit,
  } = useCreateDeckDialogController({ onCreateDeck })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Deck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
            <DialogDescription>Create a new flashcard deck to start learning.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g., Spanish Vocabulary"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Brief description of what this deck covers..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Create Deck</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
