"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Play, Clock } from "lucide-react"
import type { Deck, Card as FlashCard } from "@/components/main-dashboard"
import { CreateCardDialog } from "@/components/create-card-dialog"
import { EditCardDialog } from "@/components/edit-card-dialog"
import * as flashcardService from "@/services/flashcard-service"

// Types
interface DeckDetailProps {
  deck: Deck
  onUpdate: (deck: Deck) => void
  onBack: () => void
  onStartReview: () => void
  userId: string
}

// Model
function useDeckDetailModel(deck: Deck) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(deck.name)
  const [description, setDescription] = useState(deck.description)
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null)

  useEffect(() => {
    setName(deck.name)
    setDescription(deck.description)
  }, [deck])

  const reset = () => {
    setName(deck.name)
    setDescription(deck.description)
  }

  return {
    isEditing,
    setIsEditing,
    name,
    setName,
    description,
    setDescription,
    editingCard,
    setEditingCard,
    reset,
  }
}

// Controller
function useDeckDetailController({
  deck,
  onUpdate,
  model,
  userId,
}: {
  deck: Deck
  onUpdate: (deck: Deck) => void
  model: ReturnType<typeof useDeckDetailModel>
  userId: string
}) {
  const { name, description, setIsEditing, reset } = model

  const cardsToReview = deck.cards.filter((card) => new Date(card.nextReview) <= new Date()).length

  const handleSaveDeck = () => {
    onUpdate({
      ...deck,
      name: name.trim(),
      description: description.trim(),
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    reset()
    setIsEditing(false)
  }

  const addCard = async (front: string, back: string) => {
    try {
      const newApiCard = await flashcardService.createCard(userId, deck.id, { data: { front, back } })

      const mapApiCardToUiCard = (apiCard: flashcardService.Card): Omit<FlashCard, "deckId"> => ({
        id: apiCard.id,
        front: (apiCard.data.front as string) ?? "",
        back: (apiCard.data.back as string) ?? "",
        nextReview: new Date(apiCard.fsrs.due),
        interval: apiCard.fsrs.scheduledDays,
        easeFactor: apiCard.fsrs.difficulty,
        repetitions: apiCard.fsrs.reps,
      })
      const newCard: FlashCard = {
        ...mapApiCardToUiCard(newApiCard),
        deckId: deck.id,
      }
      onUpdate({
        ...deck,
        cards: [...deck.cards, newCard],
      })
    } catch (error) {
      console.error("Failed to create card:", error)
    }
  }

  const updateCard = async (updatedCard: FlashCard) => {
    try {
      await flashcardService.updateCard(userId, deck.id, updatedCard.id, {
        data: { front: updatedCard.front, back: updatedCard.back },
      })
      onUpdate({
        ...deck,
        cards: deck.cards.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
      })
    } catch (error) {
      console.error("Failed to update card:", error)
    }
  }

  const deleteCard = async (cardId: string) => {
    try {
      await flashcardService.deleteCard(userId, deck.id, cardId)
      onUpdate({
        ...deck,
        cards: deck.cards.filter((card) => card.id !== cardId),
      })
    } catch (error) {
      console.error("Failed to delete card:", error)
    }
  }

  const formatNextReview = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  return {
    cardsToReview,
    handleSaveDeck,
    handleCancelEdit,
    addCard,
    updateCard,
    deleteCard,
    formatNextReview,
  }
}

// View
export function DeckDetail({ deck, onUpdate, onBack, onStartReview, userId }: DeckDetailProps) {
  const model = useDeckDetailModel(deck)
  const controller = useDeckDetailController({ deck, onUpdate, model, userId })
  const { isEditing, name, description, editingCard, setIsEditing, setName, setDescription, setEditingCard } = model

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Decks
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deck-name">Deck Name</Label>
                  <Input id="deck-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="deck-description">Description</Label>
                  <Textarea
                    id="deck-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={controller.handleSaveDeck} size="sm">
                    Save
                  </Button>
                  <Button onClick={controller.handleCancelEdit} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{deck.name}</CardTitle>
                  <CardDescription className="mt-2">{deck.description}</CardDescription>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="secondary">{deck.cards.length} cards</Badge>
                    {controller.cardsToReview > 0 && (
                      <Badge variant="secondary" className="text-orange-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {controller.cardsToReview} due for review
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button onClick={onStartReview} disabled={controller.cardsToReview === 0}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Review
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Cards</h2>
          <CreateCardDialog onCreateCard={controller.addCard} />
        </div>

        {editingCard && (
          <EditCardDialog
            card={editingCard}
            onUpdateCard={controller.updateCard}
            onClose={() => setEditingCard(null)}
          />
        )}

        <div className="grid gap-4">
          {deck.cards.map((card) => (
            <Card key={card.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Front</div>
                      <div className="text-sm">{card.front}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Back</div>
                      <div className="text-sm">{card.back}</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Next review: {controller.formatNextReview(card.nextReview)}</span>
                      <span>Repetitions: {card.repetitions}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingCard(card)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => controller.deleteCard(card.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {deck.cards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No cards in this deck yet</div>
            <CreateCardDialog onCreateCard={controller.addCard} />
          </div>
        )}
      </div>
    </div>
  )
}
