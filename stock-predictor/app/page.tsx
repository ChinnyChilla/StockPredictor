import type { Metadata } from "next"
import MarketOverview from "@/components/market-overview"
import StockChart from "@/components/stock-chart"
import MarketNews from "@/components/market-news"
import Watchlist from "@/components/watchlist"
import MarketMovers from "@/components/market-movers"
import MarketEarningsCompanies from "@/components/market-earnings-companies"

export const metadata: Metadata = {
	title: "Stock Market Dashboard",
	description: "Monitor stock market performance, trends, and news",
}

export default function HomePage() {
	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<MarketOverview />
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="md:col-span-2">
					<StockChart />
				</div>
				<div>
					<MarketEarningsCompanies />
				</div>
			</div>
			{/* right side */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				
				<MarketNews />
				<MarketMovers />
			</div>
		</div>
	)
}