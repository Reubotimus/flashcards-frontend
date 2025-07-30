import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DeckDetail } from "@/components/deck-detail";
import * as flashcardService from "@/services/flashcard-service";
import type { Deck, Card as FlashCard } from "@/components/main-dashboard";

const mapApiCardToUiCard = (apiCard: flashcardService.Card, deckId: string): FlashCard => ({
    id: apiCard.id,
    deckId,
    front: (apiCard.data.front as string) ?? "",
    back: (apiCard.data.back as string) ?? "",
    nextReview: new Date(apiCard.fsrs.due),
    interval: apiCard.fsrs.scheduledDays,
    easeFactor: apiCard.fsrs.difficulty,
    repetitions: apiCard.fsrs.reps,
});

export default async function DeckDetailPage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const userId = session.user.id;
    // Server fetch deck and cards
    const apiDeck = await flashcardService.getDeck(userId, deckId);
    const { items: apiCards } = await flashcardService.listCards(userId, deckId);

    const deck: Deck = {
        id: apiDeck.id,
        name: apiDeck.name,
        description: apiDeck.description ?? "",
        cards: apiCards.map((c) => mapApiCardToUiCard(c, apiDeck.id)),
        createdAt: new Date(apiDeck.createdAt),
    };

    return <DeckDetail deck={deck} userId={userId} />;
}
