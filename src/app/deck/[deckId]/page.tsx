import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DeckDetail } from "@/components/deck-detail";

export default async function DeckDetailPage({ params }: { params: { deckId: string } }) {
    const { deckId } = await params
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/sign-in")
    }

    return (
        <DeckDetail deckId={deckId} userId={session.user.id} />
    )
}
