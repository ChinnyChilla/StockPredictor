import { NextResponse } from "next/server"
import yahooFinance from "yahoo-finance2"

// Helper function to format the fetched quote data consistently
const formatQuote = (quote: any, nameOverride?: string) => {
	const change = quote.regularMarketChange
	const percentChange = quote.regularMarketChangePercent
	const isPositive = change >= 0

	const value = quote.symbol === "^TNX"
		? `${quote.regularMarketPrice?.toFixed(2)}%`
		: quote.regularMarketPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

	return {
		name: nameOverride || quote.shortName || quote.symbol,
		symbol: quote.symbol,
		value: value,
		change: change?.toFixed(2),
		percentChange: `${isPositive ? '+' : ''}${percentChange?.toFixed(2)}%`,
		isPositive,
	}
}


export async function GET() {
	try {
		const indexTickers = ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX", "^TNX"]
		const indexNames: { [key: string]: string } = {
			"^GSPC": "S&P 500",
			"^DJI": "Dow Jones",
			"^IXIC": "Nasdaq",
			"^RUT": "Russell 2000",
			"^VIX": "VIX",
			"^TNX": "10-Yr Treasury",
		}

		const [indicesQuotes] = await Promise.all([
			yahooFinance.quote(indexTickers),
		])

		const formattedIndices = indicesQuotes.map(q => formatQuote(q, indexNames[q.symbol]))

		return NextResponse.json({
			indices: formattedIndices,
		})
	} catch (error) {
		console.error("Failed to fetch market overview data:", error)
		return NextResponse.json(
			{ error: "Could not retrieve market overview data." },
			{ status: 500 }
		)
	}
}