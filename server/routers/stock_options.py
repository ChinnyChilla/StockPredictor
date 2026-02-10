from fastapi import APIRouter, HTTPException
import yfinance as yf
import numpy as np

router = APIRouter()

@router.get("/option/{ticker}/allExpirationDates")
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

@router.get("/option/{ticker}")
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