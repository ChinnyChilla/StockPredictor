from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import yfinance as yf

router = APIRouter()

def format_quote(quote: dict, name_override: str = None) -> dict:
	"""Formats a single quote from yahoo-finance2 consistently."""
	change = quote.get("regularMarketChange")
	percent_change = quote.get("regularMarketChangePercent")
	is_positive = change >= 0 if change is not None else False

	if quote.get("symbol") == "^TNX":
		value = f"{quote.get('regularMarketPrice'):.2f}%" if quote.get('regularMarketPrice') is not None else None
	else:
		value = f"{quote.get('regularMarketPrice'):.2f}" if quote.get('regularMarketPrice') is not None else None

	formatted_quote = {
		"name": name_override or quote.get("shortName") or quote.get("symbol"),
		"symbol": quote.get("symbol"),
		"value": value,
		"change": f"{change:.2f}" if change is not None else None,
		"percentChange": f"{'+' if is_positive else ''}{percent_change:.2f}%" if percent_change is not None else None,
		"isPositive": is_positive,
	}
	return formatted_quote


@router.get("/market/overview")
async def get_market_overview_endpoint():
	"""Fetches and returns formatted market overview data."""
	index_tickers = ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX", "^TNX"]
	index_names = {
		"^GSPC": "S&P 500",
		"^DJI": "Dow Jones",
		"^IXIC": "Nasdaq",
		"^RUT": "Russell 2000",
		"^VIX": "VIX",
		"^TNX": "10-Yr Treasury",
	}

	try:
		yf_tickers = yf.Tickers(index_tickers)
		indices_quotes = [t.info for t in yf_tickers.tickers.values()] # Access .info for quote data
		
		formatted_indices = [format_quote(q, index_names.get(q.get("symbol"))) for q in indices_quotes if q is not None and q.get('symbol')]

		return JSONResponse({
				"indices": formatted_indices,
			})
	except Exception as e:
		print(f"Failed to fetch market overview data: {e}")
		raise HTTPException(status_code=500, detail="Could not retrieve market overview data.")

@router.get("/market/news")
async def get_market_news_endpoint():
	"""Fetches and returns formatted market news data."""
	try:
		news = yf.Ticker("^DJI").news
		if not news:
			print("not in here")
			return JSONResponse({"news": []})

		formatted_news = []
		for item in news:
			if not item.get("content") or not item.get("content").get("title"):
				continue
			# return news
			formatted_news.append({
				"title": item.get("content").get("title") ,
				"summary": item.get("content").get("summary"),
				"link": item.get("content").get("canonicalUrl").get("url"),
				"providerPublishTime": item.get("content").get("pubDate"),
				"publisher": item.get("content").get("provider").get("displayName")
			})

		return JSONResponse({"news": formatted_news})
	except Exception as e:
		print(f"Failed to fetch market news: {e}")
		raise HTTPException(status_code=500, detail="Could not retrieve market news.")