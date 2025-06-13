"use client"

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock market data
const marketIndices = [
  {
    name: "S&P 500",
    value: "5,234.18",
    change: "+0.87%",
    isPositive: true,
  },
  {
    name: "Dow Jones",
    value: "38,996.39",
    change: "+0.68%",
    isPositive: true,
  },
  {
    name: "Nasdaq",
    value: "16,752.92",
    change: "+1.12%",
    isPositive: true,
  },
  {
    name: "Russell 2000",
    value: "2,066.21",
    change: "-0.34%",
    isPositive: false,
  },
  {
    name: "VIX",
    value: "14.32",
    change: "-3.24%",
    isPositive: false,
  },
  {
    name: "10-Year Treasury",
    value: "4.28%",
    change: "+0.05%",
    isPositive: true,
  },
]

export default function MarketOverview() {
  return (
    <>
      {marketIndices.map((index) => (
        <Card key={index.name}>
          <CardHeader className="pb-2">
            <CardDescription>{index.name}</CardDescription>
            <CardTitle className="text-2xl">{index.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {index.isPositive ? (
                <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span className={index.isPositive ? "text-green-500" : "text-red-500"}>{index.change}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
