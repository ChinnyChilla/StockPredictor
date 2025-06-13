import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock news data
const newsItems = [
  {
    id: 1,
    title: "Fed Signals Potential Rate Cut in September",
    source: "Financial Times",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Tech Stocks Rally on Strong Earnings Reports",
    source: "Wall Street Journal",
    time: "3 hours ago",
  },
  {
    id: 3,
    title: "Oil Prices Drop Amid Supply Concerns",
    source: "Bloomberg",
    time: "5 hours ago",
  },
  {
    id: 4,
    title: "Retail Sales Beat Expectations in Q2",
    source: "CNBC",
    time: "6 hours ago",
  },
  {
    id: 5,
    title: "New IPO Surges 30% on First Trading Day",
    source: "Reuters",
    time: "8 hours ago",
  },
]

export default function MarketNews() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Market News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newsItems.map((item) => (
            <div key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
              <h3 className="font-medium">{item.title}</h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{item.source}</span>
                <span>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
