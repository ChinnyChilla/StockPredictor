"use client"

import { ArrowDownIcon, ArrowUpIcon, StarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock watchlist data
const watchlistItems = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 185.34,
    change: 2.78,
    percentChange: 1.52,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 417.56,
    change: 3.45,
    percentChange: 0.83,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 175.89,
    change: 1.23,
    percentChange: 0.71,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 178.23,
    change: -1.45,
    percentChange: -0.81,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 245.67,
    change: -3.78,
    percentChange: -1.52,
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    price: 485.12,
    change: 5.67,
    percentChange: 1.18,
  },
]

export default function Watchlist() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Watchlist</CardTitle>
        <StarIcon className="h-5 w-5 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {watchlistItems.map((item) => (
              <TableRow key={item.symbol}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.symbol}</div>
                    <div className="text-xs text-muted-foreground">{item.name}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className={item.change >= 0 ? "text-green-500" : "text-red-500"}>
                    <div className="flex items-center justify-end">
                      {item.change >= 0 ? (
                        <ArrowUpIcon className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="mr-1 h-4 w-4" />
                      )}
                      {item.percentChange.toFixed(2)}%
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
