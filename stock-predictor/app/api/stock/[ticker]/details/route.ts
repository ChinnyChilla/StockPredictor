import { NextResponse } from "next/server"
import yahooFinance from "yahoo-finance2"

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ ticker: string }> }
) {
	const {ticker} = await params

	try {
		const quoteSummary = await yahooFinance.quoteSummary(ticker, {
			modules: ["price", "summaryDetail", "assetProfile", "calendarEvents", "earnings", "earningsHistory", "earningsTrend"]
		})


		const optionSummary = await yahooFinance.options(ticker, {
			lang: "en-US",
			formatted: false,
			region: "US",
		});


		const stockDetails = {
			name: quoteSummary.price?.longName || quoteSummary.price?.shortName || ticker,
			price: quoteSummary.price?.regularMarketPrice,
			change: quoteSummary.price?.regularMarketChange,
			percentChange: quoteSummary.price?.regularMarketChangePercent,
			marketCap: quoteSummary.summaryDetail?.marketCap,
			trailingPERatio: quoteSummary.summaryDetail?.trailingPE,
			forwardPERatio: quoteSummary.summaryDetail?.forwardPE,
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