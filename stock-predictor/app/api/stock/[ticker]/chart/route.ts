import { NextResponse } from "next/server"
import yahooFinance from "yahoo-finance2"

const getChartOptions = (range: string) => {
	const now = new Date()
	let period1: Date
	let interval: any = "1d"

	switch (range.toUpperCase()) {
		case "1D":
			period1 = new Date()
			period1.setHours(0, 0, 0, 0)
			interval = "1m"
			break
		case "5D":
			period1 = new Date(now.setDate(now.getDate() - 5))
			interval = "15m"
			break
		case "2W":
			period1 = new Date(now.setDate(now.getDate() - 14))
			interval = "30m"
			break
		case "1M":
			period1 = new Date(now.setMonth(now.getMonth() - 1))
			break
		case "3M":
			period1 = new Date(now.setMonth(now.getMonth() - 3))
			break
		case "6M":
			period1 = new Date(now.setMonth(now.getMonth() - 6))
			break
		case "5Y":
			period1 = new Date(now.setFullYear(now.getFullYear() - 5))
			interval = "1wk"
			break
		case "10Y":
			period1 = new Date(now.setFullYear(now.getFullYear() - 10))
			interval = "1mo"
			break
		default:
			period1 = new Date()
			period1.setHours(0, 0, 0, 0)
			interval = "1m"
			break
	}
	return { period1: period1.toISOString().split("T")[0], interval }
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ ticker: string }> }
) {
	const { ticker } = await params;
	const { searchParams } = new URL(request.url)
	const range = searchParams.get("range") || "1D"

	try {
		const chartData = await yahooFinance.chart(ticker, getChartOptions(range))
		return NextResponse.json({
			chartData:
				chartData.quotes
					?.filter(q => q.close !== null)
					.map(q => ({
						time: new Date(q.date).toISOString(),
						price: q.close,
					})) || [],
		})
	} catch (error) {
		console.error(error)
		return NextResponse.json(
			{ error: "Failed to fetch chart data." },
			{ status: 500 }
		)
	}
}