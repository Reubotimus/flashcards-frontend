"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { GenerateCardsDialog } from "@/components/generate-cards-dialog"
import * as flashcardService from "@/services/flashcard-service"
import * as generationService from "@/services/generation-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Types
interface DeckDetailProps {
  deck: Deck
  userId: string
}

const mapApiCardToUiCard = (apiCard: flashcardService.Card): Omit<FlashCard, "deckId"> => ({
  id: apiCard.id,
  front: (apiCard.data.front as string) ?? "",
  back: (apiCard.data.back as string) ?? "",
  nextReview: new Date(apiCard.fsrs.due),
  interval: apiCard.fsrs.scheduledDays,
  easeFactor: apiCard.fsrs.difficulty,
  repetitions: apiCard.fsrs.reps,
})

// Model
function useDeckDetailModel(initialDeck: Deck) {
  const [deck, setDeck] = useState<Deck>(initialDeck)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(initialDeck.name)
  const [description, setDescription] = useState(initialDeck.description)
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null)

  const reset = () => {
    setName(deck.name)
    setDescription(deck.description)
  }

  return {
    deck,
    setDeck,
    isEditing,
    setIsEditing,
    name,
    setName,
    description,
    setDescription,
    editingCard,
    setEditingCard,
    reset,
    isLoading: false,
  }
}

// Controller
function useDeckDetailController({
  model,
  userId,
}: {
  model: ReturnType<typeof useDeckDetailModel>
  userId: string
}) {
  const { name, description, setIsEditing, reset, deck, setDeck } = model
  const todayDate = new Date()
  const cardsToReview = deck?.cards.filter(
    (card) => card.repetitions > 0 && new Date(card.nextReview) <= todayDate
  ).length || 0

  const nextReviewDate =
    deck?.cards
      .filter((card) => card.repetitions > 0 && new Date(card.nextReview) > todayDate)
      .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())[0]
      ?.nextReview ?? null

  const handleSaveDeck = async () => {
    if (!deck) return
    try {
      await flashcardService.updateDeck(userId, deck.id, {
        name: name.trim(),
        description: description.trim(),
      })
      setDeck({
        ...deck,
        name: name.trim(),
        description: description.trim(),
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save deck:", error)
    }
  }

  const handleCancelEdit = () => {
    reset()
    setIsEditing(false)
  }

  const addCard = async (front: string, back: string) => {
    if (!deck) return
    try {
      const newApiCard = await flashcardService.createCard(userId, deck.id, { data: { front, back } })

      const newCard: FlashCard = {
        ...mapApiCardToUiCard(newApiCard),
        deckId: deck.id,
      }
      setDeck({
        ...deck,
        cards: [...deck.cards, newCard],
      })
    } catch (error) {
      console.error("Failed to create card:", error)
    }
  }

  const generateCards = async (text: string) => {
    if (!deck) return
    try {
      const newApiCards = await generationService.generateCards(userId, deck.id, text)
      const newCards: FlashCard[] = newApiCards.map((c) => ({
        ...mapApiCardToUiCard(c),
        deckId: deck.id,
      }))
      setDeck({
        ...deck,
        cards: [...deck.cards, ...newCards],
      })
    } catch (error) {
      console.error("Failed to generate cards:", error)
    }
  }

  const updateCard = async (updatedCard: FlashCard) => {
    if (!deck) return
    try {
      await flashcardService.updateCard(userId, deck.id, updatedCard.id, {
        data: { front: updatedCard.front, back: updatedCard.back },
      })
      setDeck({
        ...deck,
        cards: deck.cards.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
      })
    } catch (error) {
      console.error("Failed to update card:", error)
    }
  }

  const deleteCard = async (cardId: string) => {
    if (!deck) return
    try {
      await flashcardService.deleteCard(userId, deck.id, cardId)
      setDeck({
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
    nextReviewDate, // NEW: expose nextReviewDate to the view layer
    handleSaveDeck,
    handleCancelEdit,
    addCard,
    generateCards,
    updateCard,
    deleteCard,
    formatNextReview,
  }
}

// View
export function DeckDetail({ deck, userId }: DeckDetailProps) {
  const router = useRouter()
  const model = useDeckDetailModel(deck)
  const controller = useDeckDetailController({ model, userId })
  const {
    deck: currentDeck,
    isEditing,
    name,
    description,
    editingCard,
    setIsEditing,
    setName,
    setDescription,
    setEditingCard,
    isLoading,
  } = model

  const newCards = currentDeck.cards.filter((card) => card.repetitions === 0)
  const memorizedCards =
    currentDeck.cards
      .filter((card) => card.repetitions > 0)
      .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())

  // No loading state needed; deck is always present

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
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
                  <CardTitle className="text-2xl">{currentDeck.name}</CardTitle>
                  <CardDescription className="mt-2">{currentDeck.description}</CardDescription>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="secondary">{currentDeck.cards.length} cards</Badge>
                    {controller.cardsToReview > 0 ? (
                      <Badge variant="secondary" className="text-orange-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {controller.cardsToReview} due for review
                      </Badge>
                    ) : (
                      controller.nextReviewDate && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Next review: {controller.formatNextReview(controller.nextReviewDate)}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => router.push(`/deck/${currentDeck.id}/review`)}
                    disabled={controller.cardsToReview === 0}
                  >
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
          <div className="flex gap-2">
            <CreateCardDialog onCreateCard={controller.addCard} />
            <GenerateCardsDialog onGenerateCards={controller.generateCards} />
          </div>
        </div>

        {editingCard && (
          <EditCardDialog
            card={editingCard}
            onUpdateCard={controller.updateCard}
            onClose={() => setEditingCard(null)}
          />
        )}

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New ({newCards.length})</TabsTrigger>
            <TabsTrigger value="memorized">Memorized ({memorizedCards.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="new">
            <div className="grid gap-4 mt-4">
              {newCards.map((card) => (
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
              {newCards.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No new cards.</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="memorized">
            <div className="grid gap-4 mt-4">
              {memorizedCards.map((card) => (
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
              {memorizedCards.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No memorized cards yet.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {currentDeck.cards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No cards in this deck yet</div>
            <CreateCardDialog onCreateCard={controller.addCard} />
          </div>
        )}
      </div>
    </div>
  )
}
