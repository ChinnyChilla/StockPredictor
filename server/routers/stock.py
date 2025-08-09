from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
import yfinance as yf
import datetime
from datetime import timedelta
import numpy as np

router = APIRouter()


@router.get("/stock/{ticker}/details")
async def get_stock_details(ticker: str):
	try:
		yf_ticker = yf.Ticker(ticker)
		info = yf_ticker.info
		if info.get('regularMarketPrice') is None:
			raise HTTPException(status_code=404, detail=f"Details for {ticker} not found.")

		return JSONResponse({
			"name": info.get('longName') if 'longName' in info else info.get('shortName'),
			"price": info.get('regularMarketPrice'),
			"change": info.get('regularMarketChange'),
			"percentChange": info.get('regularMarketChangePercent'),
			"marketCap": info.get('marketCap'),
			"volume": info.get('regularMarketVolume'),
			"trailingPERatio": info.get('trailingPE'),
			"forwardPERatio": info.get('forwardPE'),
			"dividendYield": info.get('dividendYield'),
			"high52Week": info.get('fiftyTwoWeekHigh'),
			"low52Week": info.get('fiftyTwoWeekLow'),
			"profile": info.get('longBusinessSummary'),
		})
	except Exception as e:
		raise HTTPException(status_code=404, detail=f"Could not retrieve details for {ticker}: {str(e)}")
	


def get_yfinance_params(range_str: str) -> dict:
	"""
	Maps the simple range string to the parameters required by yfinance.
	This is the direct equivalent of the 'getChartOptions' function.
	"""
	range_str = range_str.upper()
	params = {}

	# Define mappings for periods and intervals
	# yfinance uses 'period' for most common ranges
	range_map = {
		"1D": {"period": "1d", "interval": "1m"},
		"5D": {"period": "5d", "interval": "5m"},
		"1M": {"period": "1mo", "interval": "1d"},
		"3M": {"period": "3mo", "interval": "1d"},
		"6M": {"period": "6mo", "interval": "1d"},
		"YTD": {"period": "ytd", "interval": "1d"},
		"1Y": {"period": "1y", "interval": "1d"},
		"5Y": {"period": "5y", "interval": "1wk"},
		"10Y": {"period": "10y", "interval": "1mo"},
		"MAX": {"period": "max", "interval": "1mo"},
	}

	if range_str in range_map:
		params = range_map[range_str]
	elif range_str == "2W":
		end_date = datetime.now()
		start_date = end_date - timedelta(days=14)
		params = {
			"start": start_date.strftime('%Y-%m-%d'),
			"end": end_date.strftime('%Y-%m-%d'),
			"interval": "30m"
		}
	else:
		params = range_map["1D"]

	return params

@router.get("/stock/{ticker}/chart")
async def get_stock_chart(ticker: str, request: Request):
	range_str = request.query_params.get('range', '1D')

	try:
		params = get_yfinance_params(range_str)

		stock = yf.Ticker(ticker)
		history = stock.history(**params)

		if history.empty:
			raise HTTPException(status_code=404, detail=f"No data found for {ticker} in the specified range.")
		
		history = history.dropna(subset=['Close'])

		chart_data = [
			{"time": index.isoformat(), "price": row['Close']}
			for index, row in history.iterrows()
		]

		return {"chartData": chart_data}
	except Exception as e:
		print(f"An error occurred: {e}")
		raise HTTPException(
			status_code=500,
			detail="Failed to fetch chart data."
		)

@router.get("/stock/{ticker}/options/allExpirationDates")
async def get_all_expiration_dates(ticker: str):
	try:
		stock = yf.Ticker(ticker)
		exp_dates = stock.options

		if not exp_dates:
			raise HTTPException(status_code=404, detail=f"No options data found for {ticker}.")

		return exp_dates
	except Exception as e:
		print(f"An error occurred: {e}")
		raise HTTPException(
			status_code=500,
			detail="Failed to fetch options expiration dates."
		)

@router.get("/stock/{ticker}/options")
async def get_stock_options(ticker: str, expiration: str = None):
	try:
		stock = yf.Ticker(ticker)
		exp_dates = list(stock.options)

		if not exp_dates:
			raise HTTPException(status_code=404, detail=f"No options data found for {ticker}.")

		if expiration == None:
			chain = stock.option_chain(exp_dates[0])
			puts_df = chain.puts.replace([np.inf, -np.inf], np.nan).fillna(0)
			calls_df = chain.calls.replace([np.inf, -np.inf], np.nan).fillna(0)
			return {
				"date": exp_dates[0],
				"puts": puts_df.to_dict(orient="records"),
				"calls": calls_df.to_dict(orient="records"),
				"currentPrice": stock.history(period='1d')['Close'].iloc[0]
			}
		else:
			try:
				chain = stock.option_chain(expiration)
				puts_df = chain.puts.replace([np.inf, -np.inf], np.nan).fillna(0)
				calls_df = chain.calls.replace([np.inf, -np.inf], np.nan).fillna(0)
				return {
					"date": expiration,
					"puts": puts_df.to_dict(orient="records"),
					"calls": calls_df.to_dict(orient="records"),
					"currentPrice": stock.history(period='1d')['Close'].iloc[0]
				}
			except ValueError:
				raise HTTPException(status_code=404, detail=f"Invalid expiration date {expiration} for {ticker}.")
		return {"options": exp_dates}
	except Exception as e:
		print(f"An error occurred: {e}")
		raise HTTPException(
			status_code=500,
			detail="Failed to fetch options data."
		)