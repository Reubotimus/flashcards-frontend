"use server"
import * as flashcardService from "./flashcard-service";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { cosineSimilarity } from "@/lib/utils";
import { cardExtractionPromptText } from "./prompts/card-extraction";
import { deduplicationPromptText } from "./prompts/deduplication";

type CardData = {
    front: string;
    back: string;
    embedding?: number[];
};

export async function generateCards(userId: string, deckId: string, text: string) {
    console.log(`Generating cards for deck ${deckId} with text: ${text.substring(0, 100)}...`);

    // 1. Split text into chunks
    const chunkSize = 1500;
    const overlap = 200;
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    let start = 0;
    while (start < words.length) {
        const end = Math.min(start + chunkSize, words.length);
        const chunk = words.slice(start, end).join(' ');
        chunks.push(chunk);
        start += chunkSize - overlap;
    }
    console.log(process.env.OPENAI_API_KEY)

    const llm = new ChatOpenAI({
        modelName: "gpt-4.1-mini",
        temperature: 0.5,
        openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const embeddingsModel = new OpenAIEmbeddings({
        modelName: "text-embedding-3-small",
        openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // 2. Extract cards from chunks
    const cardExtractionPrompt = ChatPromptTemplate.fromMessages([
        ["system", cardExtractionPromptText],
        ["user", "{chunk}"]
    ]);
    const jsonParser = new JsonOutputParser();

    const allNewCards: CardData[] = [];
    for (const chunk of chunks) {
        try {
            const prompt = await cardExtractionPrompt.formatMessages({ chunk: chunk });
            const response = await llm.invoke(prompt);
            const extractedData = await jsonParser.parse(response.content as string) as { cards: CardData[] };

            if (extractedData && extractedData.cards) {
                allNewCards.push(...extractedData.cards);
            }
        } catch (e) {
            console.error("Error extracting cards from chunk", e);
        }
    }

    // 3. Get embeddings for new cards
    if (allNewCards.length > 0) {
        const newCardEmbeddings = await embeddingsModel.embedDocuments(allNewCards.map(c => c.front));
        allNewCards.forEach((card, i) => {
            card.embedding = newCardEmbeddings[i];
        });
    }

    // 4. Get existing cards and their embeddings
    const existingCardsResult = await flashcardService.listCards(userId, deckId);
    const existingCards = existingCardsResult.items;
    const cardsNeedingEmbedding = existingCards.filter(c => !(c.data as CardData).embedding);
    if (cardsNeedingEmbedding.length > 0) {
        const embeddingsToGenerate = await embeddingsModel.embedDocuments(
            cardsNeedingEmbedding.map(c => (c.data as CardData).front)
        );
        // Persist embeddings back to the API and update in-memory copies
        await Promise.all(
            cardsNeedingEmbedding.map(async (card, i) => {
                const embedding = embeddingsToGenerate[i];
                (card.data as CardData).embedding = embedding;
                try {
                    await flashcardService.patchCard(userId, deckId, card.id, {
                        data: { embedding },
                    });
                } catch (err) {
                    console.error(`Failed to persist embedding for card ${card.id}`, err);
                }
            })
        );
    }

    // 5. Find similar cards (new vs existing) and filter out duplicates
    const similarityThreshold = 0.75;
    const uniqueNewCards = allNewCards.filter(newCard => {
        for (const existingCard of existingCards) {
            if ((existingCard.data as CardData).embedding && newCard.embedding) {
                const similarity = cosineSimilarity(newCard.embedding, (existingCard.data as CardData).embedding!);
                if (similarity > similarityThreshold) {
                    return false; // It's a duplicate of an existing card
                }
            }
        }
        return true;
    });

    // 6. Find similar cards (new vs new), merge/differentiate them
    const finalCardsToCreate: CardData[] = [];
    const processedIndices = new Set<number>();

    for (let i = 0; i < uniqueNewCards.length; i++) {
        if (processedIndices.has(i)) continue;

        const similarGroup: CardData[] = [uniqueNewCards[i]];
        processedIndices.add(i);

        for (let j = i + 1; j < uniqueNewCards.length; j++) {
            if (processedIndices.has(j)) continue;
            if (uniqueNewCards[i].embedding && uniqueNewCards[j].embedding) {
                const similarity = cosineSimilarity(uniqueNewCards[i].embedding!, uniqueNewCards[j].embedding!);
                if (similarity > similarityThreshold) {
                    similarGroup.push(uniqueNewCards[j]);
                    processedIndices.add(j);
                }
            }
        }

        if (similarGroup.length > 1) {
            const deduplicationPrompt = ChatPromptTemplate.fromMessages([
                ["system", deduplicationPromptText],
                ["user", "Here are the similar cards: {cards_json}"]
            ]);

            try {
                const prompt = await deduplicationPrompt.formatMessages({
                    cards_json: JSON.stringify(similarGroup.map(c => ({ front: c.front, back: c.back })))
                });
                const response = await llm.invoke(prompt);
                const result = await jsonParser.parse(response.content as string) as { cards: CardData[] };


                if (result && result.cards) {
                    finalCardsToCreate.push(...result.cards);
                }
            } catch (e) {
                console.error("Error during card deduplication", e);
                // Fallback to just adding the first card of the group
                finalCardsToCreate.push(similarGroup[0]);
            }
        } else {
            finalCardsToCreate.push(uniqueNewCards[i]);
        }
    }

    // Ensure every card we are about to create has an embedding
    const cardsMissingEmbedding = finalCardsToCreate.filter(c => !c.embedding);
    if (cardsMissingEmbedding.length > 0) {
        const embeds = await embeddingsModel.embedDocuments(cardsMissingEmbedding.map(c => c.front));
        cardsMissingEmbedding.forEach((card, idx) => {
            card.embedding = embeds[idx];
        });
    }

    // 7. Add new cards to deck
    const createdCards = [];
    for (const card of finalCardsToCreate) {
        const newCard = await flashcardService.createCard(userId, deckId, {
            data: {
                front: card.front,
                back: card.back,
                embedding: card.embedding,
            },
        });
        createdCards.push(newCard);
    }

    console.log(`${createdCards.length} cards created for deck ${deckId}`);
    return createdCards;
}
