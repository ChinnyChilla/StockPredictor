import { NextResponse } from "next/server"
import yahooFinance from "yahoo-finance2"

export async function GET(
	request: Request,
	{ params }: { params: { ticker: string } }
) {
	const ticker = params.ticker

	try {
		const quoteSummary = await yahooFinance.quoteSummary(ticker, {
			modules: ["price", "summaryDetail", "assetProfile"],
		})

		const stockDetails = {
			name:
				quoteSummary.price?.longName || quoteSummary.price?.shortName || ticker,
			price: quoteSummary.price?.regularMarketPrice,
			change: quoteSummary.price?.regularMarketChange,
			percentChange: quoteSummary.price?.regularMarketChangePercent,
			marketCap: quoteSummary.summaryDetail?.marketCap,
			peRatio: quoteSummary.summaryDetail?.trailingPE,
			dividendYield: quoteSummary.summaryDetail?.dividendYield,
			high52Week: quoteSummary.summaryDetail?.fiftyTwoWeekHigh,
			low52Week: quoteSummary.summaryDetail?.fiftyTwoWeekLow,
			profile: quoteSummary.assetProfile?.longBusinessSummary,
		}

		return NextResponse.json(stockDetails)
	} catch (error) {
		console.error(error)
		return NextResponse.json(
			{ error: "Failed to fetch stock details." },
			{ status: 500 }
		)
	}
}