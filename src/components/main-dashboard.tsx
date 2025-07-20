"use client"

import { useState } from "react"
import { Card as UI_Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, BarChart3 } from "lucide-react"
import { CreateDeckDialog } from "@/components/create-deck-dialog"
import { DeckCard } from "@/components/deck-card"
import { ReviewSession } from "@/components/review-session"
import { DeckDetail } from "@/components/deck-detail"

// Types
export interface Card {
    id: string
    front: string
    back: string
    nextReview: Date
    interval: number
    easeFactor: number
    repetitions: number
}

export interface Deck {
    id: string
    name: string
    description: string
    cards: Card[]
    createdAt: Date
}

// Model
const useFlashcardModel = () => {
    const [decks, setDecks] = useState<Deck[]>([
        {
            id: "1",
            name: "Spanish Vocabulary",
            description: "Basic Spanish words and phrases",
            cards: [
                {
                    id: "1",
                    front: "Hola",
                    back: "Hello",
                    nextReview: new Date(Date.now() - 86400000), // Yesterday
                    interval: 1,
                    easeFactor: 2.5,
                    repetitions: 0,
                },
                {
                    id: "2",
                    front: "Gracias",
                    back: "Thank you",
                    nextReview: new Date(Date.now() + 86400000), // Tomorrow
                    interval: 2,
                    easeFactor: 2.5,
                    repetitions: 1,
                },
            ],
            createdAt: new Date(),
        },
        {
            id: "2",
            name: "JavaScript Concepts",
            description: "Important JavaScript programming concepts",
            cards: [
                {
                    id: "3",
                    front: "What is a closure?",
                    back: "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.",
                    nextReview: new Date(Date.now() - 3600000), // 1 hour ago
                    interval: 1,
                    easeFactor: 2.5,
                    repetitions: 0,
                },
            ],
            createdAt: new Date(),
        },
    ])

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
}: ReturnType<typeof useFlashcardModel>) => {
    const createDeck = (name: string, description: string) => {
        const newDeck: Deck = {
            id: Date.now().toString(),
            name,
            description,
            cards: [],
            createdAt: new Date(),
        }
        setDecks([...decks, newDeck])
    }

    const updateDeck = (updatedDeck: Deck) => {
        setDecks(decks.map((deck) => (deck.id === updatedDeck.id ? updatedDeck : deck)))
    }

    const deleteDeck = (deckId: string) => {
        setDecks(decks.filter((deck) => deck.id !== deckId))
        if (selectedDeck?.id === deckId) {
            setCurrentView("dashboard")
            setSelectedDeck(null)
        }
    }

    const openDeck = (deck: Deck) => {
        setSelectedDeck(deck)
        setCurrentView("deck")
    }

    const startReview = (deck: Deck) => {
        const cardsToReview = deck.cards.filter((card) => new Date(card.nextReview) <= new Date())
        if (cardsToReview.length > 0) {
            setReviewCards(cardsToReview)
            setSelectedDeck(deck)
            setCurrentView("review")
        }
    }

    const finishReview = (updatedCards: Card[]) => {
        if (selectedDeck) {
            const updatedDeck = {
                ...selectedDeck,
                cards: selectedDeck.cards.map((card) => {
                    const updatedCard = updatedCards.find((c) => c.id === card.id)
                    return updatedCard || card
                }),
            }
            updateDeck(updatedDeck)
            setSelectedDeck(updatedDeck)
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
export function MainDashboard() {
    const model = useFlashcardModel()
    const controller = useFlashcardController(model)

    const { decks, currentView, selectedDeck, reviewCards } = model

    if (currentView === "review" && reviewCards.length > 0 && selectedDeck) {
        return (
            <ReviewSession
                cards={reviewCards}
                deckName={selectedDeck.name}
                onFinish={controller.finishReview}
                onBack={controller.goToDashboard}
            />
        )
    }

    if (currentView === "deck" && selectedDeck) {
        return (
            <DeckDetail
                deck={selectedDeck}
                onUpdate={controller.updateDeck}
                onBack={controller.goToDashboard}
                onStartReview={() => controller.startReview(selectedDeck)}
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