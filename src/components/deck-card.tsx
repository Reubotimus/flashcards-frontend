"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Play, Trash2, Edit, Clock } from "lucide-react"
import type { Deck } from "@/app/page"

interface DeckCardProps {
  deck: Deck
  onOpen: () => void
  onDelete: () => void
  onStartReview: () => void
}

export function DeckCard({ deck, onOpen, onDelete, onStartReview }: DeckCardProps) {
  const cardsToReview = deck.cards.filter((card) => new Date(card.nextReview) <= new Date()).length

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex-1">
          <CardTitle className="text-lg">{deck.name}</CardTitle>
          <CardDescription className="mt-1">{deck.description}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpen}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Deck
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Deck
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">{deck.cards.length} cards</div>
          {cardsToReview > 0 && (
            <Badge variant="secondary" className="text-orange-600">
              <Clock className="h-3 w-3 mr-1" />
              {cardsToReview} due
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={onOpen} variant="outline" size="sm" className="flex-1 bg-transparent">
            <Edit className="h-4 w-4 mr-2" />
            Manage
          </Button>
          <Button onClick={onStartReview} size="sm" className="flex-1" disabled={cardsToReview === 0}>
            <Play className="h-4 w-4 mr-2" />
            Review
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
