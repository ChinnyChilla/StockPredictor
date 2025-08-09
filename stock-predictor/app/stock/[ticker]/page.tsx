import SingleStockView from "@/app/pages/single-stock-view"
import type { Metadata } from "next"


interface SingleStockPageProps {
	params: Promise<{ ticker: string }>;
}

export async function generateMetadata({
	params,
}: SingleStockPageProps): Promise<Metadata> {
	const ticker = (await params).ticker.toUpperCase();
	return {
		title: `${ticker} | Stock Details`,
		description: `Live price, chart, news, and analysis for ${ticker}.`,
	};
}

export default async function SingleStockPage({ params }: SingleStockPageProps) {
	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<SingleStockView ticker={(await params).ticker} />
		</div>
	);
}