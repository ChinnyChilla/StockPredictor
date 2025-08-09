"use client"

import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	ReferenceLine,
} from "recharts"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	ArrowDownIcon,
	ArrowUpIcon,
	Building,
	TrendingUp,
} from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import FlashingSpan from "@/components/ui/flashing-span"
import OptionsCard from "@/components/single_stock/options_card"

function PageSpinner() {
	return (
		<div className="flex h-96 w-full items-center justify-center">
			<div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
		</div>
	)
}

function ChartSpinner() {
	return (
		<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
			<div className="h-8 w-8 animate-spin rounded-full border-2 border-dashed border-primary"></div>
		</div>
	)
}

// Helper to format large numbers into B (billions) or M (millions)
function formatNumber(num: number): string {
	if (num === null || num === undefined) return 'N/A';
	if (num >= 1_000_000_000_000) {
		return (num / 1_000_000_000_000).toFixed(2) + 'T';
	}
	if (num >= 1_000_000_000) {
		return (num / 1_000_000_000).toFixed(2) + 'B';
	}
	if (num >= 1_000_000) {
		return (num / 1_000_000).toFixed(2) + 'M';
	}
	if (num >= 1_000) {
		return (num / 1000).toFixed(2) + 'K';
	}
	return num.toString();
}

const timeframes = ["1D", "5D", "1M", "3M", "6M", "YTD", "1Y", "5Y", "10Y", "MAX"]
const shortTimeframes = ["1D", "5D"]

export default function SingleStockView({ ticker }: { ticker: string }) {
	const router = useRouter()
	const [stock, setStock] = useState<any>(null)
	const [chartData, setChartData] = useState<any[]>([])
	const [pageLoading, setPageLoading] = useState(true)
	const [chartLoading, setChartLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [timeframe, setTimeframe] = useState("1D")
	const [chartLoadingKey, setChartLoadingKey] = useState(0)
	const [livePriceData, setLivePriceData] = useState<any>(null)

	useEffect(() => {
		if (!ticker) return

		const interval = setInterval(async () => {
			try {
				const response = await fetch(`/api/stocks/${ticker}/currentPrice`)
				if (!response.ok) throw new Error("Failed to fetch current price")
				const data = await response.json()
				setLivePriceData(data)
			} catch (err) {
				console.error("Price update error", err)
			}
		}, 5000)

			// Initial fetch
			; (async () => {
				try {
					const response = await fetch(`/api/stocks/${ticker}/currentPrice`)
					if (!response.ok) throw new Error("Failed to fetch current price")
					const data = await response.json()
					setLivePriceData(data)
				} catch (err) {
					console.error("Initial price fetch failed", err)
				}
			})()

		return () => clearInterval(interval)
	}, [ticker])

	useEffect(() => {
		setChartLoadingKey(prev => prev + 1)
	}, [chartData])

	useEffect(() => {
		async function fetchStockDetails() {
			setPageLoading(true)
			setError(null)
			try {
				const response = await fetch(`/api/stock/${ticker}/details`)
				if (!response.ok) throw new Error("Failed to fetch stock details. \n This stock probably doesnt exist")
				const data = await response.json()
				setStock(data)
			} catch (err: any) {
				setError(err.message)
			} finally {
				setPageLoading(false)
			}
		}
		if (ticker) fetchStockDetails()
	}, [ticker])

	useEffect(() => {
		async function fetchChartData() {
			setChartLoading(true)
			try {
				const response = await fetch(`/api/stock/${ticker}/chart?range=${timeframe}`)
				if (!response.ok) throw new Error("Failed to load chart data.")
				const data = await response.json()
				setChartData(data.chartData)
			} catch (err: any) {
				console.error(err.message)
			} finally {
				setChartLoading(false)
			}
		}
		if (ticker) fetchChartData()
	}, [ticker, timeframe])

	useEffect(() => {
		const clip = document.getElementById("clip-rect")
		if (clip) {
			clip.setAttribute("width", "0%")
			clip.animate(
				[{ width: "0%" }, { width: "100%" }],
				{
					duration: 1200,
					easing: "ease-out",
					fill: "forwards",
				}
			)
		}
		
	}, [chartData])

	const chartPerformance = useMemo(() => {
		if (chartData.length < 2) return null
		const startPrice = chartData[0].price
		const endPrice = chartData[chartData.length - 1].price
		const valueChange = endPrice - startPrice
		const percentChange = (valueChange / startPrice) * 100
		return {
			valueChange: valueChange.toFixed(2),
			percentChange: percentChange.toFixed(2),
			isPositive: valueChange >= 0,
		}
	}, [chartData])

	const marketIndicators = useMemo(() => {
		if (!shortTimeframes.includes(timeframe) || chartData.length === 0) {
			return null
		}
		const indicators: React.ReactNode[] = []

		chartData.forEach(point => {
			
			const date = new Date(point.time)
			const hours = date.getHours()
			const minutes = date.getMinutes()

			const timeStr = new Date(point.time).toISOString()

			// Check for exactly 9:30 AM
			if (hours === 9 && minutes === 30) {
				indicators.push(
					<ReferenceLine
						key={`${timeStr}-open`}
						x={point.time}
						stroke="blue"
						strokeDasharray="3 3"
						strokeWidth={1}
						label={false}
					>
					</ReferenceLine>
				)
			}

			if (hours === 16 && minutes === 0) {
				indicators.push(
					<ReferenceLine
						key={`${timeStr}-close`}
						x={point.time}
						stroke="blue"
						strokeDasharray="3 3"
						strokeWidth={1}
						label={false}
					>
					</ReferenceLine>
				)
			}
		})
		
		return indicators
	}, [chartData, timeframe])
	

	const formatTick = (tick: string) => {
		const date = new Date(tick)
		if (timeframe === "1D") {
			return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
		}
		else if (timeframe === "5D") {
			return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }) + " " +
				date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
		}
		return date.toLocaleDateString()
	}

	if (pageLoading) return <PageSpinner />
	if (error) {
		return (
			<Card className="flex h-96 w-full items-center justify-center bg-red-50 dark:bg-red-900/20">
				<div className="text-center">
					<CardTitle className="text-2xl text-red-600 dark:text-red-400">
						Error
					</CardTitle>
					<CardDescription className="text-red-500 dark:text-red-400/80">
						{error}
					</CardDescription>
					{/* 3. Add the button here */}
					<Button
						variant="destructive"
						className="mt-4"
						onClick={() => router.back()}
					>
						Go Back
					</Button>
				</div>
			</Card>
		)
	}
	if (!stock) return null

	const isPositive = stock.change >= 0

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2 space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-3xl">{stock.name}</CardTitle>
								<CardDescription className="text-lg">{ticker.toUpperCase()}</CardDescription>
							</div>
							<div className="text-right">
								{livePriceData ? (
									<div className="space-y-1">
										<div>
											<div className="flex items-center justify-end">
												<FlashingSpan value={livePriceData.last_price} className={`${livePriceData.source == "during-hours" ? "text-3xl" : "text-2xl"} font-bold`} />
												<div className={`ml-2 flex items-center text-sm ${livePriceData.last_price_percent >= 0 ? "text-green-500" : "text-red-500"}`}>
													{livePriceData.last_price_percent >= 0 ? <ArrowUpIcon className="mr-1 h-4 w-4" /> : <ArrowDownIcon className="mr-1 h-4 w-4" />}
													{livePriceData.last_price_percent.toFixed(2)}%
												</div>
											</div>
										</div>

										{livePriceData.source === "after-hours" && (
											<div>
												<div className="text-muted-foreground text-sm">After Hours</div>
												<div className="flex items-center justify-end">
													<FlashingSpan value={livePriceData.post_price} className="text-2xl font-bold" />
													<div className={`ml-2 flex items-center text-sm ${livePriceData.post_price_percent >= 0 ? "text-green-500" : "text-red-500"}`}>
														{livePriceData.post_price_percent >= 0 ? <ArrowUpIcon className="mr-1 h-4 w-4" /> : <ArrowDownIcon className="mr-1 h-4 w-4" />}
														{livePriceData.post_price_percent.toFixed(2)}%
													</div>
												</div>
											</div>
										)}

										{livePriceData.source === "before-hours" && (
											<div>
												<div className="text-muted-foreground text-sm">Pre-Market</div>
												<div className="flex items-center justify-end">
													<FlashingSpan value={livePriceData.pre_price} className="text-2xl font-bold" />
													<div className={`ml-2 flex items-center text-sm ${livePriceData.pre_price_percent >= 0 ? "text-green-500" : "text-red-500"}`}>
														{livePriceData.pre_price_percent >= 0 ? <ArrowUpIcon className="mr-1 h-4 w-4" /> : <ArrowDownIcon className="mr-1 h-4 w-4" />}
														{livePriceData.pre_price_percent.toFixed(2)}%
													</div>
												</div>
											</div>
										)}
									</div>
								) : (
									<div className="text-2xl font-bold">--</div>
								)}
							</div>
						</div>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Chart</CardTitle>
						{chartPerformance && (
							<div className={`text-right ${chartPerformance.isPositive ? "text-green-500" : "text-red-500"}`}>
								<div className="font-bold">{chartPerformance.valueChange} ({chartPerformance.percentChange}%)</div>
								<div className="text-xs text-muted-foreground">{timeframe} Change</div>
							</div>
						)}
					</CardHeader>
					<CardContent className="pt-2">
						<div className="h-[350px] relative overflow-hidden">
							{chartLoading && <ChartSpinner />}

							{/* Sweep overlay */}
							<div key={chartLoadingKey} className="absolute top-0 left-0 h-full w-full bg-white z-10 animate-sweep pointer-events-none" />

							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={chartData}
									margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
								>
									<defs>
										{/* <clipPath id="reveal-clip">
											<rect id="clip-rect" x="0" y="0" width="0%" height="100%" />
										</clipPath> */}
										<linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3} />
											<stop offset="95%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0} />
										</linearGradient>
									</defs>

									<XAxis
										dataKey="time"
										tickFormatter={formatTick}
										tickLine={false}
										axisLine={false}
										tickMargin={10}
										minTickGap={80}
										hide
									/>
									<YAxis
										domain={["dataMin - 1", "dataMax + 1"]}
										tickFormatter={(num) => `$${num.toFixed(2)}`}
										width={80}
									/>
									<Tooltip
										labelFormatter={(label) => formatTick(label)}
										formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
									/>
									<Area
										type="monotone"
										dataKey="price"
										stroke={isPositive ? "#10B981" : "#EF4444"}
										fill="url(#chart-gradient)"
										strokeWidth={2}
										isAnimationActive={false}
										clipPath="url(#reveal-clip)"
									/>
									{marketIndicators}
								</AreaChart>
							</ResponsiveContainer>
						</div>
						<div className="flex justify-center gap-1 sm:gap-2 mt-4">
							{timeframes.map((t) => (
								<button key={t} onClick={() => setTimeframe(t)} disabled={chartLoading}
									className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50",
										timeframe === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
									{t}
								</button>
							))}
						</div>
					</CardContent>
				</Card>

				<Tabs defaultValue="stats" className="w-full">
					<TabsList>
						<TabsTrigger value="stats"><TrendingUp className="mr-2 h-4 w-4" />Key Statistics</TabsTrigger>
						<TabsTrigger value="profile"><Building className="mr-2 h-4 w-4" />Profile</TabsTrigger>
					</TabsList>
					<TabsContent value="stats">
						<Card><CardContent className="pt-6">
							<Table>
								<TableBody>
									<TableRow><TableCell className="font-medium">Market Cap</TableCell><TableCell className="text-right">{formatNumber(stock.marketCap) || "N/A"}</TableCell></TableRow>
									<TableRow><TableCell className="font-medium">Trailing P/E Ratio</TableCell><TableCell className="text-right">{stock.trailingPERatio?.toFixed(2) || "N/A"}</TableCell></TableRow>
									<TableRow><TableCell className="font-medium">Forward P/E Ratio</TableCell><TableCell className="text-right">{stock.forwardPERatio?.toFixed(2) || "N/A"}</TableCell></TableRow>
									<TableRow><TableCell className="font-medium">Dividend Yield</TableCell><TableCell className="text-right">{stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : "N/A"}</TableCell></TableRow>
									<TableRow><TableCell className="font-medium">52-Week High</TableCell><TableCell className="text-right">${stock.high52Week?.toFixed(2) || "N/A"}</TableCell></TableRow>
									<TableRow><TableCell className="font-medium">52-Week Low</TableCell><TableCell className="text-right">${stock.low52Week?.toFixed(2) || "N/A"}</TableCell></TableRow>
								</TableBody>
							</Table>
						</CardContent></Card>
					</TabsContent>
					<TabsContent value="profile">
						<Card>
							<CardHeader><CardTitle>About {stock.name}</CardTitle></CardHeader>
							<CardContent><p className="text-muted-foreground">{stock.profile}</p></CardContent>
						</Card>
					</TabsContent>
				</Tabs>
				<OptionsCard ticker={ticker} />
			</div>

			<div className="lg:col-span-1 space-y-6">
				<Card className="h-96">
					<CardHeader><CardTitle>Placeholder Card</CardTitle><CardDescription>Big pen pinapple pen</CardDescription></CardHeader>
					<CardContent></CardContent>
				</Card>
			</div>
		</div>
	)
}