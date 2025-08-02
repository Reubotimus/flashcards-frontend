import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import * as flashcardService from "@/services/flashcard-service"
import type { Card } from "@/components/main-dashboard"
import { ReviewSessionClient } from "@/components/review-session-client"
import { cookies } from "next/headers"
import { parse } from "url"

// Removed in-file client component; now using dedicated client component.

// Utility to map service card to UI card used by ReviewSession
const mapApiCardToUiCard = (
    apiCard: flashcardService.Card,
    deckId: string,
): Card => ({
    id: apiCard.id,
    deckId,
    front: (apiCard.data.front as string) ?? "",
    back: (apiCard.data.back as string) ?? "",
    nextReview: new Date(apiCard.fsrs.due),
    interval: apiCard.fsrs.scheduledDays,
    easeFactor: apiCard.fsrs.difficulty,
    repetitions: apiCard.fsrs.reps,
})

export default async function DeckReviewPage({
    params,
    searchParams,
}: {
    params: Promise<{ deckId: string }>
    searchParams?: Promise<{ mode?: string }>
}) {
    const { deckId } = await params
    const resolvedSearchParams = searchParams ? await searchParams : undefined
    // Authenticate the user
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/sign-in")
    }

    const userId = session.user.id

    // Fetch deck and cards
    const deck = await flashcardService.getDeck(userId, deckId)
    const { items: apiCards } = await flashcardService.listCards(userId, deckId)

    // Determine mode from query param
    const mode = resolvedSearchParams?.mode
    let reviewCards: Card[]
    if (mode === "new") {
        reviewCards = apiCards
            .map((c) => mapApiCardToUiCard(c, deckId))
            .filter((card) => card.repetitions === 0)
    } else {
        reviewCards = apiCards
            .map((c) => mapApiCardToUiCard(c, deckId))
            .filter((card) => card.repetitions > 0 && new Date(card.nextReview) <= new Date())
    }

    if (reviewCards.length === 0) {
        redirect(`/deck/${deckId}`)
    }

    return (
        <ReviewSessionClient
            cards={reviewCards}
            deckName={deck.name}
            deckId={deckId}
            userId={userId}
            mode={mode === 'new' ? 'new' : 'normal'}
        />
    )
} 