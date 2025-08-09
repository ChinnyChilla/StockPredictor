"use client"

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock market movers data
const topGainers = [
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 950.32, percentChange: 8.45 },
  { symbol: "AMD", name: "Advanced Micro Devices", price: 178.45, percentChange: 6.78 },
  { symbol: "INTC", name: "Intel Corp.", price: 45.67, percentChange: 5.43 },
  { symbol: "CRM", name: "Salesforce Inc.", price: 285.34, percentChange: 4.56 },
  { symbol: "ADBE", name: "Adobe Inc.", price: 567.89, percentChange: 3.98 },
]

const topLosers = [
  { symbol: "NFLX", name: "Netflix Inc.", price: 612.34, percentChange: -4.56 },
  { symbol: "DIS", name: "Walt Disney Co.", price: 112.45, percentChange: -3.78 },
  { symbol: "PFE", name: "Pfizer Inc.", price: 28.67, percentChange: -3.45 },
  { symbol: "KO", name: "Coca-Cola Co.", price: 58.23, percentChange: -2.87 },
  { symbol: "WMT", name: "Walmart Inc.", price: 67.89, percentChange: -2.34 },
]

export default function MarketMovers() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Market Movers</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers">
          <TabsList className="mb-4">
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
          </TabsList>
          <TabsContent value="gainers">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topGainers.map((item) => (
                  <TableRow key={item.symbol}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">{item.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end text-green-500">
                        <ArrowUpIcon className="mr-1 h-4 w-4" />
                        {item.percentChange.toFixed(2)}%
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="losers">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLosers.map((item) => (
                  <TableRow key={item.symbol}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">{item.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end text-red-500">
                        <ArrowDownIcon className="mr-1 h-4 w-4" />
                        {Math.abs(item.percentChange).toFixed(2)}%
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
