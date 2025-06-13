import SingleStockView from "@/components/single-stock-view"
import type { Metadata } from "next"


export async function generateMetadata({
	params,
}: {
	params: { ticker: string }
}): Promise<Metadata> {
	const ticker = params.ticker.toUpperCase()
	return {
		title: `${ticker} | Stock Details`,
		description: `Live price, chart, news, and analysis for ${ticker}.`,
	}
}

export default function SingleStockPage({
	params,
}: {
	params: { ticker: string }
}) {
	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<SingleStockView ticker={params.ticker} />
		</div>
	)
}