"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock stock data for AAPL
const stockData = {
  "1D": [
    { time: "9:30", price: 182.56 },
    { time: "10:00", price: 183.21 },
    { time: "10:30", price: 183.45 },
    { time: "11:00", price: 182.98 },
    { time: "11:30", price: 183.67 },
    { time: "12:00", price: 183.42 },
    { time: "12:30", price: 183.89 },
    { time: "13:00", price: 184.23 },
    { time: "13:30", price: 184.56 },
    { time: "14:00", price: 184.12 },
    { time: "14:30", price: 184.78 },
    { time: "15:00", price: 185.01 },
    { time: "15:30", price: 184.89 },
    { time: "16:00", price: 185.34 },
  ],
  "1W": [
    { time: "Mon", price: 180.25 },
    { time: "Tue", price: 181.78 },
    { time: "Wed", price: 182.45 },
    { time: "Thu", price: 183.67 },
    { time: "Fri", price: 185.34 },
  ],
  "1M": [
    { time: "Week 1", price: 175.34 },
    { time: "Week 2", price: 178.56 },
    { time: "Week 3", price: 180.23 },
    { time: "Week 4", price: 185.34 },
  ],
  "3M": [
    { time: "Jan", price: 170.45 },
    { time: "Feb", price: 175.67 },
    { time: "Mar", price: 185.34 },
  ],
  "1Y": [
    { time: "Q1", price: 150.23 },
    { time: "Q2", price: 165.78 },
    { time: "Q3", price: 175.45 },
    { time: "Q4", price: 185.34 },
  ],
  "5Y": [
    { time: "2019", price: 75.34 },
    { time: "2020", price: 95.67 },
    { time: "2021", price: 125.45 },
    { time: "2022", price: 145.78 },
    { time: "2023", price: 165.23 },
    { time: "2024", price: 185.34 },
  ],
}

export default function StockChart() {
  const [timeframe, setTimeframe] = useState("1D")
  const data = stockData[timeframe as keyof typeof stockData]
  const currentPrice = data[data.length - 1].price
  const previousPrice = data[0].price
  const priceChange = currentPrice - previousPrice
  const percentChange = ((priceChange / previousPrice) * 100).toFixed(2)
  const isPositive = priceChange >= 0

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AAPL</CardTitle>
            <CardDescription>Apple Inc.</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
            <div className={isPositive ? "text-green-500" : "text-red-500"}>
              {isPositive ? "+" : ""}
              {priceChange.toFixed(2)} ({isPositive ? "+" : ""}
              {percentChange}%)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="1D" value={timeframe} onValueChange={setTimeframe}>
          <TabsList className="mb-4">
            <TabsTrigger value="1D">1D</TabsTrigger>
            <TabsTrigger value="1W">1W</TabsTrigger>
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="3M">3M</TabsTrigger>
            <TabsTrigger value="1Y">1Y</TabsTrigger>
            <TabsTrigger value="5Y">5Y</TabsTrigger>
          </TabsList>
          <TabsContent value={timeframe} className="h-[300px]">
            <ChartContainer
              config={{
                price: {
                  label: "Price",
                  color: isPositive ? "hsl(142.1, 76.2%, 36.3%)" : "hsl(0, 84.2%, 60.2%)",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={isPositive ? "hsl(142.1, 76.2%, 36.3%)" : "hsl(0, 84.2%, 60.2%)"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={isPositive ? "hsl(142.1, 76.2%, 36.3%)" : "hsl(0, 84.2%, 60.2%)"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis
                    domain={["dataMin - 1", "dataMax + 1"]}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "var(--color-price)" : "var(--color-price)"}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
