"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CalendarDays, Forward, Hourglass, Info, Sunrise, Sunset } from "lucide-react"
import { text } from "stream/consumers"

interface Earning {
	ticker: string
	earnings_date: string
	earnings_timing: "bmo" | "amc" | "dmh" | ""
	avg_volume: number
	eps_estimate: number
	expected_move: number
	iv30_rv30: number
	rating: number
	ts_slope: number
}

interface GroupedEarnings {
	[key: string]: Earning[]
}

function EarningsSpinner() {
	return (
		<div className="flex items-center justify-center h-48">
			<div className="h-8 w-8 animate-spin rounded-full border-2 border-dashed border-primary"></div>
		</div>
	)
}

function parseDateString(dateString: string) {
	const parts = dateString.split('-');
	const year = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10);
	const day = parseInt(parts[2], 10);
	return [year, month - 1, day];
}

// Helper to format large numbers into B (billions) or M (millions)
function formatNumber(num: number): string {
	if (num === null || num === undefined) return 'N/A';
	if (num >= 1_000_000_000) {
		return (num / 1_000_000_000).toFixed(1) + 'B';
	}
	if (num >= 1_000_000) {
		return (num / 1_000_000).toFixed(1) + 'M';
	}
	if (num >= 1_000) {
		return (num / 1000).toFixed(1) + 'K';
	}
	return num.toString();
}


const getGroupTitle = (dateStr: string, hour: Earning["earnings_timing"]): { title: string, icon: React.ReactNode, order: number } => {
	const today = new Date()
	const tomorrow = new Date()
	tomorrow.setDate(today.getDate() + 1)
	const parsedDate = parseDateString(dateStr.slice(0, 10))
	const earningDate = new Date(parsedDate[0], parsedDate[1], parsedDate[2])

	const isToday = today.toDateString() === earningDate.toDateString()
	const isTomorrow = tomorrow.toDateString() === earningDate.toDateString()

	const dateLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : earningDate.toLocaleDateString("en-US", { weekday: 'long', timeZone: 'UTC' })

	switch (hour) {
		case "bmo": return { title: `${dateLabel} - Pre-Market`, icon: <Sunrise size={14} />, order: 1 }
		case "dmh": return { title: `${dateLabel} - During Hours`, icon: <Hourglass size={14} />, order: 2 }
		case "amc": return { title: `${dateLabel} - After Close`, icon: <Sunset size={14} />, order: 3 }
		default: return { title: `${dateLabel} - Unknown Time`, icon: <CalendarDays size={14} />, order: 4 }
	}1500000
}

const getRatingColor = (rating: number) => {
	if (rating === 1) return "text-green-500"
	if (rating === 0) return "text-yellow-500"
	return "text-red-500"
}

const getVolColor = (amt: number) => {
	if (amt >= 1500000) return "text-green-500"
	return "text-red-500"
}

const getIVRVColor = (rating: number) => {
	if (rating >= 1.25) return "text-green-500"
	return "text-red-500"
}
const getTSColor = (rating: number) => {
	if (rating <= -0.00406) return "text-green-500"
	return "text-red-500"
}

export default function MarketEarningsCompanies() {
	const [earnings, setEarnings] = useState<Earning[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function fetchEarnings() {
			setLoading(true)
			setError(null)
			try {
				const response = await fetch("/api/earnings")
				if (!response.ok) throw new Error("Failed to load earnings data.")
				const data = await response.json()
				setEarnings(data)
			} catch (err: any) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}
		fetchEarnings()
	}, [])

	const groupedAndSortedEarnings = useMemo(() => {
		const grouped = earnings.reduce((acc: GroupedEarnings, earning) => {
			const { title } = getGroupTitle(earning.earnings_date, earning.earnings_timing)
			if (!acc[title]) acc[title] = []
			acc[title].push(earning)
			return acc
		}, {})

		return Object.entries(grouped).sort(([keyA], [keyB]) => {
			const dateA = new Date(grouped[keyA][0].earnings_date)
			const dateB = new Date(grouped[keyB][0].earnings_date)
			if (dateA.getTime() !== dateB.getTime()) {
				return dateA.getTime() - dateB.getTime()
			}
			const orderA = getGroupTitle(grouped[keyA][0].earnings_date, grouped[keyA][0].earnings_timing).order
			const orderB = getGroupTitle(grouped[keyB][0].earnings_date, grouped[keyB][0].earnings_timing).order
			return orderA - orderB
		})
	}, [earnings])

	return (
		<TooltipProvider>
			<Card className="h-full flex flex-col">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Forward className="h-5 w-5 text-muted-foreground" />
						<CardTitle>Upcoming Earnings</CardTitle>
					</div>
					<CardDescription>
						Key earnings announcements for the next 7 days.
					</CardDescription>
				</CardHeader>
				<CardContent className="pr-0 pl-2 flex-grow overflow-hidden">
					<div className="h-full overflow-y-auto pr-4">
						{loading ? <EarningsSpinner /> : error ? <div className="text-red-500 text-center py-8">{error}</div> : (
							<div className="space-y-4">
								{groupedAndSortedEarnings.map(([groupTitle, groupEarnings]) => (
									<div key={groupTitle}>
										<div className="flex items-center gap-2 mb-2 top-0 bg-background py-2">
											<div className="text-muted-foreground">{getGroupTitle(groupEarnings[0].earnings_date, groupEarnings[0].earnings_timing).icon}</div>
											<h4 className="font-semibold text-sm text-muted-foreground">{groupTitle}</h4>
										</div>
										<Table>
											<TableBody>
												{groupEarnings.map(earning => (
													<TableRow key={earning.ticker} className="hover:bg-muted/50 border-t-0">
														<TableCell className="py-2 px-2 font-medium w-[70px]">
															<Link href={`/stock/${earning.ticker}`} className="text-primary hover:underline">{earning.ticker}</Link>
														</TableCell>
														<TableCell className="py-2 px-2 text-xs text-muted-foreground w-[70px]">
															<div className="font-semibold">Est. EPS</div>
															<div>{earning.eps_estimate?.toFixed(2) ?? 'N/A'}</div>
														</TableCell>
														<TableCell className="py-2 px-2 text-xs text-muted-foreground w-[70px]">
															<div className="font-semibold">Exp. Move</div>
															<div>{earning.expected_move?.toFixed(2) ?? 'N/A'}%</div>
														</TableCell>
														<TableCell className={`py-2 px-2 text-center font-semibold ${getRatingColor(earning.rating)} w-[40px]`}>
															{earning.rating?.toFixed(1)}
														</TableCell>
														<TableCell className="py-2 pl-1 pr-2 w-[30px] text-right">
															<Tooltip>
																<TooltipTrigger asChild>
																	<button><Info size={14} className="text-muted-foreground hover:text-foreground" /></button>
																</TooltipTrigger>
																<TooltipContent>
																	<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs p-1">
																		<span className="font-semibold">Avg Vol:</span>
																		<span className={`text-right font-medium ${getVolColor(earning.avg_volume)}`}>
																			{formatNumber(earning.avg_volume)}
																		</span>
																		<span className="font-semibold">IV/RV:</span>
																		<span className={`text-right font-medium ${getIVRVColor(earning.iv30_rv30)}`}>
																			{earning.iv30_rv30?.toFixed(6) ?? 'N/A'}
																		</span>
																		<span className="font-semibold">TS Slope:</span>
																		<span className={`text-right font-medium ${getTSColor(earning.ts_slope)}`}>
																			{earning.ts_slope?.toFixed(6) ?? 'N/A'}
																		</span>
																	</div>
																</TooltipContent>
															</Tooltip>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								))}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</TooltipProvider>
	)
}
