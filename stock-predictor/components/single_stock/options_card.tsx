"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import FlashingSpan from "@/components/ui/flashing-span" // Make sure this path is correct
import { cn } from "@/lib/utils"
import { getApiUrl } from "@/lib/api_config"

interface Option {
	contractSymbol: string
	strike: number
	lastPrice: number
	bid: number
	ask: number
	change: number
	inTheMoney: boolean
}

interface OptionsChain {
	calls: Option[]
	puts: Option[]
	currentPrice: number
}

interface CombinedOption {
	strike: number
	call?: Option
	put?: Option
}

function isMarketOpen() {
	const now = new Date();
	const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
	const day = easternTime.getDay();
	const hour = easternTime.getHours();
	const minute = easternTime.getMinutes();

	if (day < 1 || day > 5) {
		return false;
	}

	if (hour < 9 || (hour === 9 && minute < 30) || hour >= 16) {
		return false;
	}

	return true;
}

const getChangeColor = (change: number | undefined) => {
	if (change === undefined || change === null) return "text-muted-foreground";
	if (change > 0) return "text-green-500";
	if (change < 0) return "text-red-500";
	return "text-muted-foreground";
}

const formatChange = (change: number | undefined) => {
	if (change === undefined || change === null) return '-';
	const fixedChange = change.toFixed(2);
	if (change > 0) return `+${fixedChange}`;
	return fixedChange;
}


export default function OptionsCard({ ticker }: { ticker: string }) {
	const [expirationDates, setExpirationDates] = useState<string[]>([])
	const [selectedExpiration, setSelectedExpiration] = useState<string | undefined>(undefined)
	const [strikeCount, setStrikeCount] = useState<string>("10");
	const [optionsChain, setOptionsChain] = useState<OptionsChain | null>(null)
	const [loadingExpirations, setLoadingExpirations] = useState(true)
	const [loadingChain, setLoadingChain] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function fetchExpirations() {
			setLoadingExpirations(true)
			try {
				const response = await fetch(getApiUrl(`/api/option/${ticker}/allExpirationDates`))
				if (!response.ok) throw new Error("Failed to load expiration dates.")
				const data = await response.json()
				if (Array.isArray(data) && data.length > 0) {
					setExpirationDates(data)
					setSelectedExpiration(data[0])
				} else {
					setExpirationDates([])
				}
			} catch (err: any) {
				setError(err.message)
			} finally {
				setLoadingExpirations(false)
			}
		}
		if (ticker) fetchExpirations()
	}, [ticker])

	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;

		async function fetchOptionsChain() {
			if (!selectedExpiration) return

			if (!optionsChain) {
				setLoadingChain(true)
			}
			setError(null)

			try {
				const response = await fetch(getApiUrl(`/api/option/${ticker}?expiration=${selectedExpiration}`))
				if (!response.ok) throw new Error("Failed to load options chain.")
				const data = await response.json()
				setOptionsChain(data)
			} catch (err: any) {
				setError(err.message)
				if (intervalId) clearInterval(intervalId);
			} finally {
				setLoadingChain(false)
			}
		}

		if (ticker && selectedExpiration) {
			fetchOptionsChain();

			if (isMarketOpen()) {
				intervalId = setInterval(fetchOptionsChain, 30000);
			}
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [ticker, selectedExpiration])

	const combinedChain = useMemo((): CombinedOption[] => {
		if (!optionsChain) return []
		const allStrikes = Array.from(new Set([...optionsChain.calls.map(c => c.strike), ...optionsChain.puts.map(p => p.strike)]))
			.sort((a, b) => a - b)
			.map(strike => ({
				strike,
				call: optionsChain.calls.find(c => c.strike === strike),
				put: optionsChain.puts.find(p => p.strike === strike)
			}));

		console.log(optionsChain)
		if (strikeCount === "all" || !optionsChain.currentPrice) {
			console.log("Returning all strikes:", optionsChain.currentPrice);
			return allStrikes;
		}

		const count = parseInt(strikeCount, 10);
		if (allStrikes.length <= count) {
			return allStrikes;
		}

		const closestStrikeIndex = allStrikes.reduce((closestIndex, current, index) => {
			const currentDiff = Math.abs(current.strike - optionsChain.currentPrice);
			const closestDiff = Math.abs(allStrikes[closestIndex].strike - optionsChain.currentPrice);
			return currentDiff < closestDiff ? index : closestIndex;
		}, 0);

		let startIndex = closestStrikeIndex - Math.floor(count / 2);
		let endIndex = startIndex + count;

		if (startIndex < 0) {
			startIndex = 0;
			endIndex = count;
		} else if (endIndex > allStrikes.length) {
			endIndex = allStrikes.length;
			startIndex = endIndex - count;
		}

		return allStrikes.slice(startIndex, endIndex);

	}, [optionsChain, strikeCount])

	return (
		<Card>
			<CardHeader>
				<CardTitle>Options Chain</CardTitle>
				<div className="flex gap-4">
					{loadingExpirations ? (
						<Skeleton className="h-10 w-48" />
					) : (
						<Select value={selectedExpiration} onValueChange={setSelectedExpiration}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Select Expiration" />
							</SelectTrigger>
							<SelectContent>
								{expirationDates.map(date => (
									<SelectItem key={date} value={date}>
										{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
					<Select value={strikeCount} onValueChange={setStrikeCount}>
						<SelectTrigger className="w-[120px]">
							<SelectValue placeholder="Strikes" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10 Strikes</SelectItem>
							<SelectItem value="20">20 Strikes</SelectItem>
							<SelectItem value="50">50 Strikes</SelectItem>
							<SelectItem value="all">All Strikes</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				{loadingChain ? (
					<div className="space-y-2">
						{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
					</div>
				) : error ? (
					<div className="text-red-500 text-center py-8">{error}</div>
				) : (
					<div className="overflow-x-auto">
						<Table className="min-w-full">
							<TableHeader>
								<TableRow>
									<TableHead colSpan={4} className="text-center font-bold">PUTS</TableHead>
									<TableHead className="text-center font-bold w-[100px]">STRIKE</TableHead>
									<TableHead colSpan={4} className="text-center font-bold">CALLS</TableHead>
								</TableRow>
								<TableRow>
									<TableHead className="text-center">Chg</TableHead>
									<TableHead className="text-center">Last</TableHead>
									<TableHead className="text-center">Ask</TableHead>
									<TableHead className="text-center">Bid</TableHead>
									<TableHead className="text-center font-bold bg-muted/50"></TableHead>
									<TableHead className="text-center">Bid</TableHead>
									<TableHead className="text-center">Ask</TableHead>
									<TableHead className="text-center">Last</TableHead>
									<TableHead className="text-center">Chg</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{combinedChain.map(({ strike, call, put }) => (
									<TableRow key={strike}>
										{/* Puts */}
										<TableCell className={cn("text-center font-medium", getChangeColor(put?.change))}>
											{formatChange(put?.change)}
										</TableCell>
										<TableCell className={cn("text-center", put?.inTheMoney && "bg-blue-50 dark:bg-blue-900/20")}>
											<FlashingSpan value={put?.lastPrice} />
										</TableCell>
										<TableCell className={cn("text-center", put?.inTheMoney && "bg-blue-50 dark:bg-blue-900/20")}>
											<FlashingSpan value={put?.ask} />
										</TableCell>
										<TableCell className={cn("text-center", put?.inTheMoney && "bg-blue-50 dark:bg-blue-900/20")}>
											<FlashingSpan value={put?.bid} />
										</TableCell>

										{/* Strike */}
										<TableCell className="text-center font-bold bg-muted/50">{strike.toFixed(2)}</TableCell>

										{/* Calls */}
										<TableCell className={cn("text-center", call?.inTheMoney && "bg-blue-50 dark:bg-blue-900/20")}>
											<FlashingSpan value={call?.bid} />
										</TableCell>
										<TableCell className={cn("text-center", call?.inTheMoney && "bg-blue-50 dark:bg-blue-900/20")}>
											<FlashingSpan value={call?.ask} />
										</TableCell>
										<TableCell className={cn("text-center", call?.inTheMoney && "bg-blue-50 dark:bg-blue-900/20")}>
											<FlashingSpan value={call?.lastPrice} />
										</TableCell>
										<TableCell className={cn("text-center font-medium", getChangeColor(call?.change))}>
											{formatChange(call?.change)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
