"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Play, Trash2, Edit, Clock } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  type TooltipContentProps as RechartsTooltipProps,
} from "recharts"
import type { Deck } from "@/components/main-dashboard"

interface DeckCardProps {
  deck: Deck
  onOpen: () => void
  onDelete: () => void
  onStartReview: () => void
  onStartNewCardsReview: () => void // NEW PROP
}

export function DeckCard({ deck, onOpen, onDelete, onStartReview, onStartNewCardsReview }: DeckCardProps) {
  const todayDate = new Date()
  const cardsToReview = deck.cards.filter(
    (card) => card.repetitions > 0 && new Date(card.nextReview) <= todayDate
  ).length

  // Build chart data: number of reviews per day for existing cards (exclude new cards with repetitions === 0)
  const reviewsMap: Record<string, number> = {}
  deck.cards
    .filter((card) => card.repetitions > 0) // exclude new flashcards
    .forEach((card) => {
      const dateKey = card.nextReview > new Date() ? card.nextReview.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
      reviewsMap[dateKey] = (reviewsMap[dateKey] || 0) + 1
    })

  // Build data for the next 14 days (today inclusive)
  const today = new Date()
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateKey = date.toISOString().split("T")[0]
    return {
      date: dateKey,
      count: reviewsMap[dateKey] || 0,
    }
  })

  const CustomTooltip = ({ active, payload }: RechartsTooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const dateString = payload[0].payload.date as string
      return (
        <div className="rounded-md border bg-background p-2 shadow-sm">
          <p className="text-sm">
            {new Date(dateString).toLocaleDateString()}
          </p>
          <p className="font-semibold">{payload[0].value as number} reviews</p>
        </div>
      )
    }
    return null
  }

  const newCardsCount = deck.cards.filter((card) => card.repetitions === 0).length

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
        {/* Review distribution bar chart */}
        {chartData.length > 0 && (
          <div className="mb-4 h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                {/* Show Y axis only */}
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={24}
                  domain={[0, "dataMax"]}
                />
                {/* Hidden X axis replaced by omitting XAxis component */}
                <RechartsTooltip content={CustomTooltip} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={onOpen} variant="outline" size="sm" className="flex-1 bg-transparent">
            <Edit className="h-4 w-4 mr-2" />
            Manage
          </Button>
          <Button onClick={onStartReview} size="sm" className="flex-1" disabled={cardsToReview === 0}>
            <Play className="h-4 w-4 mr-2" />
            Review
          </Button>
          <Button onClick={onStartNewCardsReview} size="sm" className="flex-1" disabled={newCardsCount === 0}>
            <Play className="h-4 w-4 mr-2" />
            New Cards
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
