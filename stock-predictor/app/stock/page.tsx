import type { Metadata } from "next"
import MarketOverview from "@/components/main_page/market-overview"
import MarketNews from "@/components/main_page/market-news"
import MarketEarningsCompanies from "@/components/main_page/market-earnings-companies"
import SearchBar from "@/components/main_page/search-bar"

export const metadata: Metadata = {
	title: "Michael Zheng's Page",
	description: "Place for all of Michael Zheng's projects",
}

export default function HomePage() {
	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div className="flex justify-center">
				<SearchBar />
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<MarketOverview />
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="md:col-span-2">
					<MarketNews />
				</div>
				<div>
					<MarketEarningsCompanies />
				</div>
			</div>
		</div>
	)
}