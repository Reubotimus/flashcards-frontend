"use client"

import { useRouter } from "next/navigation"
import { ReviewSession } from "@/components/review-session"
import type { Card } from "@/components/main-dashboard"

interface ReviewSessionClientProps {
    cards: Card[]
    deckName: string
    deckId: string
    userId: string
}

export function ReviewSessionClient({
    cards,
    deckName,
    deckId,
    userId,
}: ReviewSessionClientProps) {
    const router = useRouter()
    return (
        <ReviewSession
            cards={cards}
            deckName={deckName}
            onFinish={() => router.push(`/deck/${deckId}`)}
            onBack={() => router.push(`/deck/${deckId}`)}
            userId={userId}
        />
    )
} 