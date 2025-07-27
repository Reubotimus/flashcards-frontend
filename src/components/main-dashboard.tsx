"use client"

import { useState, useEffect } from "react"
import { Card as UI_Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, BarChart3 } from "lucide-react"
import { CreateDeckDialog } from "@/components/create-deck-dialog"
import { DeckCard } from "@/components/deck-card"
import { ReviewSession } from "@/components/review-session"
import { DeckDetail } from "@/components/deck-detail"
import * as flashcardService from "@/services/flashcard-service"
import { redirect } from "next/navigation"

// Types
export interface Card {
    id: string
    front: string
    back: string
    nextReview: Date
    // These fields from the old model are now part of the FSRS snapshot on the service Card type.
    // To keep components working, we'll map them.
    interval: number
    easeFactor: number
    repetitions: number
    // Added deckId for service calls
    deckId: string
}

export interface Deck {
    id: string
    name: string
    description: string
    cards: Card[]
    createdAt: Date
}

// Model
const useFlashcardModel = ({ userId }: { userId: string }) => {
    const [decks, setDecks] = useState<Deck[]>([])

    useEffect(() => {
        if (!userId) return

        const mapApiCardToUiCard = (apiCard: flashcardService.Card, deckId: string): Card => ({
            id: apiCard.id,
            deckId: deckId,
            front: (apiCard.data.front as string) ?? "",
            back: (apiCard.data.back as string) ?? "",
            nextReview: new Date(apiCard.fsrs.due),
            interval: apiCard.fsrs.scheduledDays,
            easeFactor: apiCard.fsrs.difficulty,
            repetitions: apiCard.fsrs.reps,
        })

        const loadDecks = async () => {
            try {
                const { items: apiDecks } = await flashcardService.listDecks(userId)
                const decksWithCards: Deck[] = await Promise.all(
                    apiDecks.map(async (deck) => {
                        const { items: apiCards } = await flashcardService.listCards(userId, deck.id)
                        return {
                            id: deck.id,
                            name: deck.name,
                            description: deck.description ?? "",
                            cards: apiCards.map((c) => mapApiCardToUiCard(c, deck.id)),
                            createdAt: new Date(deck.createdAt),
                        }
                    }),
                )
                setDecks(decksWithCards)
            } catch (error) {
                console.error("Failed to load decks:", error)
                // Handle error appropriately in a real app
            }
        }

        loadDecks()
    }, [userId])

    const [currentView, setCurrentView] = useState<"dashboard" | "deck" | "review">("dashboard")
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
    const [reviewCards, setReviewCards] = useState<Card[]>([])

    return {
        decks,
        setDecks,
        currentView,
        setCurrentView,
        selectedDeck,
        setSelectedDeck,
        reviewCards,
        setReviewCards,
    }
}

// Controller
const useFlashcardController = ({
    decks,
    setDecks,
    selectedDeck,
    setSelectedDeck,
    setCurrentView,
    setReviewCards,
    userId,
}: ReturnType<typeof useFlashcardModel> & { userId: string }) => {
    const createDeck = async (name: string, description: string) => {
        try {
            const newApiDeck = await flashcardService.createDeck(userId, { name, description })
            const newDeck: Deck = {
                id: newApiDeck.id,
                name: newApiDeck.name,
                description: newApiDeck.description ?? "",
                cards: [],
                createdAt: new Date(newApiDeck.createdAt),
            }
            setDecks([...decks, newDeck])
        } catch (error) {
            console.error("Failed to create deck:", error)
        }
    }

    const updateDeck = async (updatedDeck: Deck) => {
        try {
            await flashcardService.updateDeck(userId, updatedDeck.id, {
                name: updatedDeck.name,
                description: updatedDeck.description,
            })
            const newDecks = decks.map((deck) => (deck.id === updatedDeck.id ? updatedDeck : deck))
            setDecks(newDecks)
            setSelectedDeck(updatedDeck)
        } catch (error) {
            console.error("Failed to update deck:", error)
        }
    }

    const deleteDeck = async (deckId: string) => {
        try {
            await flashcardService.deleteDeck(userId, deckId)
            setDecks(decks.filter((deck) => deck.id !== deckId))
            if (selectedDeck?.id === deckId) {
                setCurrentView("dashboard")
                setSelectedDeck(null)
            }
        } catch (error) {
            console.error("Failed to delete deck:", error)
        }
    }

    const openDeck = (deck: Deck) => {
        redirect(`/deck/${deck.id}`)
    }

    const startReview = (deck: Deck) => {
        const cardsToReview = deck.cards.filter((card) => new Date(card.nextReview) <= new Date())
        if (cardsToReview.length > 0) {
            setReviewCards(cardsToReview)
            setSelectedDeck(deck)
            setCurrentView("review")
        }
    }

    const finishReview = () => {
        // The review logic is now handled in the ReviewSession component.
        // This function is called when the session is over, so we just
        // need to refresh the data and go back to the dashboard.
        if (selectedDeck) {
            // Re-fetch the deck to get the latest card statuses
            const loadDeck = async () => {
                try {
                    const { items: apiCards } = await flashcardService.listCards(userId, selectedDeck.id)

                    const mapApiCardToUiCard = (apiCard: flashcardService.Card, deckId: string): Card => ({
                        id: apiCard.id,
                        deckId: deckId,
                        front: (apiCard.data.front as string) ?? "",
                        back: (apiCard.data.back as string) ?? "",
                        nextReview: new Date(apiCard.fsrs.due),
                        interval: apiCard.fsrs.scheduledDays,
                        easeFactor: apiCard.fsrs.difficulty,
                        repetitions: apiCard.fsrs.reps,
                    })

                    const updatedDeck = {
                        ...selectedDeck,
                        cards: apiCards.map((c) => mapApiCardToUiCard(c, selectedDeck.id)),
                    }
                    updateDeck(updatedDeck)
                    setSelectedDeck(updatedDeck)
                } catch (error) {
                    console.error("Failed to reload deck after review:", error)
                }
            }
            loadDeck()
        }
        setCurrentView("dashboard")
        setReviewCards([])
    }

    const getTotalCards = () => decks.reduce((total, deck) => total + deck.cards.length, 0)
    const getCardsToReview = () =>
        decks.reduce(
            (total, deck) => total + deck.cards.filter((card) => new Date(card.nextReview) <= new Date()).length,
            0,
        )

    const goToDashboard = () => setCurrentView("dashboard")

    return {
        createDeck,
        updateDeck,
        deleteDeck,
        openDeck,
        startReview,
        finishReview,
        getTotalCards,
        getCardsToReview,
        goToDashboard,
    }
}

// View
export function MainDashboard({ userId }: { userId: string }) {
    const model = useFlashcardModel({ userId })
    const controller = useFlashcardController({ ...model, userId })

    const { decks, currentView, selectedDeck, reviewCards } = model

    if (currentView === "review" && reviewCards.length > 0 && selectedDeck) {
        return (
            <ReviewSession
                cards={reviewCards}
                deckName={selectedDeck.name}
                onFinish={controller.finishReview}
                onBack={controller.goToDashboard}
                userId={userId}
            />
        )
    }

    if (currentView === "deck" && selectedDeck) {
        return (
            <DeckDetail
                deckId={selectedDeck.id}
                userId={userId}
            />
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Spaced Repetition</h1>
                        <p className="text-muted-foreground">Master your learning with intelligent flashcards</p>
                    </div>
                    <CreateDeckDialog onCreateDeck={controller.createDeck} />
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <UI_Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{decks.length}</div>
                        </CardContent>
                    </UI_Card>
                    <UI_Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{controller.getTotalCards()}</div>
                        </CardContent>
                    </UI_Card>
                    <UI_Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{controller.getCardsToReview()}</div>
                        </CardContent>
                    </UI_Card>
                </div>

                {/* Decks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map((deck) => (
                        <DeckCard
                            key={deck.id}
                            deck={deck}
                            onOpen={() => controller.openDeck(deck)}
                            onDelete={() => controller.deleteDeck(deck.id)}
                            onStartReview={() => controller.startReview(deck)}
                        />
                    ))}
                </div>

                {decks.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No decks yet</h3>
                        <p className="text-muted-foreground mb-4">Create your first deck to start learning</p>
                        <CreateDeckDialog onCreateDeck={controller.createDeck} />
                    </div>
                )}
            </div>
        </div>
    )
} 