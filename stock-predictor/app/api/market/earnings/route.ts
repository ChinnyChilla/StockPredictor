import { NextResponse } from "next/server"
import * as finnhub from "finnhub"

export async function GET() {
	try {
		const apiKey = process.env.FINNHUB_API_KEY
		if (!apiKey) {
			throw new Error("Finnhub API key is not configured.")
		}

		const api_key = finnhub.ApiClient.instance.authentications["api_key"]
		api_key.apiKey = apiKey
		const finnhubClient = new finnhub.DefaultApi()

		const today = new Date()
		const nextWeek = new Date()
		nextWeek.setDate(today.getDate() + 7)

		const fromDate = today.toISOString().split("T")[0]
		const toDate = nextWeek.toISOString().split("T")[0]

		const earningsCalendar = await new Promise((resolve, reject) => {
			finnhubClient.earningsCalendar({ from: fromDate, to: toDate }, (error: any, data: any) => {
				if (error) return reject(error)
				resolve(data)
			})
		}) as { earningsCalendar: any[] }

		if (!earningsCalendar || !earningsCalendar.earningsCalendar) {
			return NextResponse.json([])
		}

		const formattedEarnings = earningsCalendar.earningsCalendar
			.filter(event => event.symbol && event.date)
			.map(event => ({
				ticker: event.symbol,
				// Pass the exact date and the time-of-day code (bmo, amc, dmh)
				date: event.date,
				hour: event.hour
			}))

		return NextResponse.json(formattedEarnings)

	} catch (error) {
		console.error("Failed to fetch Finnhub earnings calendar:", error)
		return NextResponse.json(
			{ error: "Could not retrieve earnings data from Finnhub." },
			{ status: 500 }
		)
	}
}