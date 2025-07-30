import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import * as flashcardService from "@/services/flashcard-service"
import type { Card } from "@/components/main-dashboard"
import { ReviewSessionClient } from "@/components/review-session-client"

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
}: {
    params: { deckId: string }
}) {
    const { deckId } = params
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

    // Prepare cards due for review (same logic as in MainDashboard)
    const reviewCards: Card[] = apiCards
        .map((c) => mapApiCardToUiCard(c, deckId))
        .filter((card) => new Date(card.nextReview) <= new Date())

    // If no cards are due, redirect back to the deck detail page
    if (reviewCards.length === 0) {
        redirect(`/deck/${deckId}`)
    }

    return (
        <ReviewSessionClient
            cards={reviewCards}
            deckName={deck.name}
            deckId={deckId}
            userId={userId}
        />
    )
} 