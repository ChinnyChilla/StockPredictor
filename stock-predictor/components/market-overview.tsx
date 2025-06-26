"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowDownIcon, ArrowUpIcon, BarChart, LineChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface MarketItem {
	name: string
	symbol: string
	value: string
	change?: string
	percentChange: string
	isPositive: boolean
}

// A reusable card component for displaying each item
const MarketCard = ({ item, isIndex = false }: { item: MarketItem, isIndex?: boolean }) => (
	<Card>
		<Link href={`/stock/${item.symbol.replace('^', '')}`}>
			<CardHeader className="pb-2">
				<CardDescription className="flex items-center gap-2">
					{isIndex ? <BarChart className="h-4 w-4 text-muted-foreground" /> : <LineChart className="h-4 w-4 text-muted-foreground" />}
					{item.name}
				</CardDescription>
				<CardTitle className="text-2xl">{item.value}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center text-sm">
					{item.isPositive ? (
						<ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
					) : (
						<ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
					)}
					<span className={item.isPositive ? "text-green-500" : "text-red-500"}>
						{item.percentChange}
					</span>
				</div>
			</CardContent>
		</Link>
	</Card>
)

// Skeleton loader for when the data is being fetched
const MarketSkeleton = () => (
	<>
		{Array.from({ length: 12 }).map((_, i) => (
			<Card key={i}>
				<CardHeader className="pb-2">
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-8 w-1/2 mt-1" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-5 w-1/3" />
				</CardContent>
			</Card>
		))}
	</>
)

export default function MarketOverview() {
	const [marketData, setMarketData] = useState<{
		indices: MarketItem[],
		trending: MarketItem[]
	} | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function fetchMarketData() {
			setLoading(true)
			try {
				const response = await fetch("/api/market/overview")
				if (!response.ok) {
					throw new Error("Failed to fetch market data")
				}
				const data = await response.json()
				setMarketData(data)
			} catch (error) {
				console.error(error)
			} finally {
				setLoading(false)
			}
		}
		fetchMarketData()
	}, [])

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 col-span-1 lg:col-span-3">
			{loading || !marketData ? (
				<MarketSkeleton />
			) : (
				<>
					{marketData.indices.map(item => (
						<MarketCard key={item.symbol} item={item} isIndex={true} />
					))}
					{marketData.trending.map(item => (
						<MarketCard key={item.symbol} item={item} />
					))}
				</>
			)}
		</div>
	)
}