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
import { CalendarDays, Forward, Hourglass, Sun, Sunset } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface Earning {
	ticker: string
	date: string
	hour: "bmo" | "amc" | "dmh" | ""
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

/**
 * Converts a "YYYY-MM-DD" date string into an array of numbers
 * [year, monthIndex, day] for use with the new Date() constructor.
 * * @param {string} dateString - The date string in "YYYY-MM-DD" format.
 * @returns {number[]} An array containing [year, monthIndex, day].
 */
function parseDateString(dateString: string) {
	const parts = dateString.split('-');

	const year = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10);
	const day = parseInt(parts[2], 10);

	return [year, month - 1, day];
  }

// Helper to create the group title based on the date and time
const getGroupTitle = (dateStr: string, hour: Earning["hour"]): { title: string, icon: React.ReactNode, order: number } => {
	const today = new Date()
	const tomorrow = new Date()
	tomorrow.setDate(today.getDate() + 1)
	const parsedDate = parseDateString(dateStr.slice(0, 10))
	const earningDate = new Date(parsedDate[0], parsedDate[1], parsedDate[2])

	const isToday = today.toDateString() === earningDate.toDateString()
	const isTomorrow = tomorrow.toDateString() === earningDate.toDateString()

	const dateLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : earningDate.toLocaleDateString("en-US", { weekday: 'long', timeZone: 'UTC' })

	switch (hour) {
		case "bmo":
			return { title: `${dateLabel} - Pre-Market`, icon: <Sun size={14} />, order: 1 }
		case "dmh":
			return { title: `${dateLabel} - During Hours`, icon: <Hourglass size={14} />, order: 2 }
		case "amc":
			return { title: `${dateLabel} - After Close`, icon: <Sunset size={14} />, order: 3 }
		default:
			return { title: `${dateLabel} - Unknown Time`, icon: <CalendarDays size={14} />, order: 4 }
	}
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
				const response = await fetch("/api/market/earnings")
				if (!response.ok) throw new Error("Failed to load earnings data.")
				const data = await response.json()
				console.log(data);
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
		const now = new Date()

		// Group by time and date
		const grouped = earnings.reduce((acc: GroupedEarnings, earning) => {
			const { title } = getGroupTitle(earning.date, earning.hour)
			if (!acc[title]) {
				acc[title] = []
			}
			acc[title].push(earning)
			return acc
		}, {})

		return Object.entries(grouped).sort(([keyA], [keyB]) => {
			const dateA = new Date(grouped[keyA][0].date)
			const dateB = new Date(grouped[keyB][0].date)
			if (dateA.getTime() !== dateB.getTime()) {
				return dateA.getTime() - dateB.getTime()
			}
			const orderA = getGroupTitle(grouped[keyA][0].date, grouped[keyA][0].hour).order
			const orderB = getGroupTitle(grouped[keyB][0].date, grouped[keyB][0].hour).order
			return orderA - orderB
		})
	}, [earnings])

	return (
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
			<CardContent className="pr-2 flex-grow overflow-hidden">
				<div className="h-full overflow-y-auto">
					{loading ? <EarningsSpinner /> : error ? <div className="text-red-500 text-center py-8">{error}</div> : (
						<div className="space-y-4">
							{groupedAndSortedEarnings.map(([groupTitle, groupEarnings], index) => (
								<div key={groupTitle}>
									<div className="flex items-center gap-2 mb-2 top-0 bg-background py-2">
										<div className="text-muted-foreground">{getGroupTitle(groupEarnings[0].date, groupEarnings[0].hour).icon}</div>
										<h4 className="font-semibold text-sm text-muted-foreground">{groupTitle}</h4>
									</div>
									<Table>
										<TableBody>
											{groupEarnings.map(earning => (
												<TableRow key={earning.ticker} className="hover:bg-muted/50 border-t-0">
													<TableCell className="py-2">
														<Link href={`/stock/${earning.ticker}`} className="flex flex-col group">
															<div className="font-medium text-primary group-hover:underline">{earning.ticker}</div>
														</Link>
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
	)
}