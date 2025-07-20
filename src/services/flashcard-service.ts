import axios from 'axios';

// ──────────────────────────────────────────
//
//               TYPE DEFINITIONS
//
// ──────────────────────────────────────────
// These types are based on your API contracts.

export enum Rating {
    Again = 'Again',
    Hard = 'Hard',
    Good = 'Good',
    Easy = 'Easy',
}

export enum State {
    New = 'New',
    Learning = 'Learning',
    Review = 'Review',
    Relearning = 'Relearning',
}

export interface FsrsSnapshot {
    due: string;
    stability: number;
    difficulty: number;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    state: State;
    lastReview?: string;
    learningSteps: number;
}

export interface Deck {
    id: string;
    userId: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Card {
    id: string;
    deckId: string;
    userId: string;
    data: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    fsrs: FsrsSnapshot;
}

export interface ReviewLog {
    id: number;
    cardId: string;
    userId: string;
    rating: Rating;
    state: State;
    due: string;
    stability: number;
    difficulty: number;
    elapsedDays: number;
    lastElapsedDays: number;
    scheduledDays: number;
    review: string;
}

export interface ReviewResult {
    card: Card;
    log: ReviewLog;
}

// DTOs for creating and updating resources

export interface CreateDeckDTO {
    name: string;
    description?: string;
}

export interface UpdateDeckDTO {
    name?: string;
    description?: string;
}

export interface CreateCardDTO {
    data: Record<string, unknown>;
}

export interface UpdateCardDTO {
    data: Record<string, unknown>;
}

export interface PatchCardDTO {
    data: Record<string, unknown>;
}

export interface ReviewDTO {
    rating: Rating;
    reviewDate?: string; // ISO 8601 string
}

export interface Paginated<T> {
    items: T[];
}


// ──────────────────────────────────────────
//
//               API CLIENT
//
// ──────────────────────────────────────────

// The API client is configured via environment variables.
// Create a .env.local file in the root of your project
// and add the following:
// NEXT_PUBLIC_FSRS_API_URL=http://localhost:3000
// NEXT_PUBLIC_FSRS_API_KEY=your_api_key
const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_FSRS_API_URL,
    headers: {
        'X-API-Key': process.env.NEXT_PUBLIC_FSRS_API_KEY,
        'Content-Type': 'application/json',
    },
});


// --- Decks ---

export const listDecks = async (userId: string): Promise<Paginated<Deck>> => {
    const response = await http.get(`/users/${userId}/decks`);
    return response.data;
};

export const createDeck = async (userId: string, data: CreateDeckDTO): Promise<Deck> => {
    const response = await http.post(`/users/${userId}/decks`, data);
    return response.data;
};

export const getDeck = async (userId: string, deckId: string): Promise<Deck> => {
    const response = await http.get(`/users/${userId}/decks/${deckId}`);
    return response.data;
};

export const updateDeck = async (userId: string, deckId: string, data: UpdateDeckDTO): Promise<Deck> => {
    const response = await http.put(`/users/${userId}/decks/${deckId}`, data);
    return response.data;
};

export const deleteDeck = async (userId: string, deckId: string): Promise<void> => {
    await http.delete(`/users/${userId}/decks/${deckId}`);
};

// --- Cards ---

export const listCards = async (userId: string, deckId: string): Promise<Paginated<Card>> => {
    const response = await http.get(`/users/${userId}/decks/${deckId}/cards`);
    return response.data;
};

export const createCard = async (userId: string, deckId: string, data: CreateCardDTO): Promise<Card> => {
    const response = await http.post(`/users/${userId}/decks/${deckId}/cards`, data);
    return response.data;
};

export const getCard = async (userId: string, deckId: string, cardId: string): Promise<Card> => {
    const response = await http.get(`/users/${userId}/decks/${deckId}/cards/${cardId}`);
    return response.data;
};

export const updateCard = async (userId: string, deckId: string, cardId: string, data: UpdateCardDTO): Promise<Card> => {
    const response = await http.put(`/users/${userId}/decks/${deckId}/cards/${cardId}`, data);
    return response.data;
};

export const patchCard = async (userId: string, deckId: string, cardId: string, data: PatchCardDTO): Promise<Card> => {
    const response = await http.patch(`/users/${userId}/decks/${deckId}/cards/${cardId}`, data);
    return response.data;
};

export const deleteCard = async (userId: string, deckId: string, cardId: string): Promise<void> => {
    await http.delete(`/users/${userId}/decks/${deckId}/cards/${cardId}`);
};

// --- Review ---

export const reviewCard = async (userId: string, deckId: string, cardId: string, data: ReviewDTO): Promise<ReviewResult> => {
    const response = await http.post(`/users/${userId}/decks/${deckId}/cards/${cardId}/review`, data);
    return response.data;
};
