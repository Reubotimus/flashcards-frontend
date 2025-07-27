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
import { Wand2 } from "lucide-react"

// Types
interface GenerateCardsDialogProps {
    onGenerateCards: (text: string) => Promise<void>
}

// Model
const useGenerateCardsDialogModel = () => {
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)

    return {
        open,
        setOpen,
        text,
        setText,
        isGenerating,
        setIsGenerating,
    }
}

// Controller
const useGenerateCardsDialogController = ({
    model,
    onGenerateCards,
}: {
    model: ReturnType<typeof useGenerateCardsDialogModel>
    onGenerateCards: GenerateCardsDialogProps["onGenerateCards"]
}) => {
    const { text, setText, setOpen, isGenerating, setIsGenerating } = model

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (text.trim() && !isGenerating) {
            setIsGenerating(true)
            try {
                await onGenerateCards(text.trim())
                setText("")
                setOpen(false)
            } catch (error) {
                console.error("Failed to generate cards:", error)
                // Optionally, show an error message to the user
            } finally {
                setIsGenerating(false)
            }
        }
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value)
    }

    const handleCancel = () => {
        setOpen(false)
    }

    return { handleSubmit, handleTextChange, handleCancel }
}

// View
export function GenerateCardsDialog({ onGenerateCards }: GenerateCardsDialogProps) {
    const model = useGenerateCardsDialogModel()
    const { open, setOpen, text, isGenerating } = model
    const controller = useGenerateCardsDialogController({ model, onGenerateCards })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Cards
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[55vw] max-h-[70vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Generate Cards from Text</DialogTitle>
                    <DialogDescription>
                        Paste in your notes, and we&apos;ll automatically create flashcards for you.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={controller.handleSubmit} className="flex-grow overflow-y-auto">
                    <fieldset disabled={isGenerating} className="grid gap-4 py-4 px-1">
                        <div className="grid gap-2">
                            <Label htmlFor="text-content">Your Notes</Label>
                            <Textarea
                                id="text-content"
                                value={text}
                                onChange={controller.handleTextChange}
                                placeholder="Paste your content here..."
                                rows={15}
                                required
                            />
                        </div>
                    </fieldset>
                    <DialogFooter className="sticky bottom-0 bg-background pt-4">
                        <Button type="button" variant="outline" onClick={controller.handleCancel} disabled={isGenerating}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isGenerating}>
                            {isGenerating ? "Generating..." : "Generate"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
} 