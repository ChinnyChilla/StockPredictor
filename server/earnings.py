import yfinance as yf
from datetime import datetime, timedelta
from scipy.interpolate import interp1d
import numpy as np
from dotenv import load_dotenv
import finnhub
import os

load_dotenv()

finnhub_client = finnhub.Client(api_key=os.getenv("FINNHUB_API_KEY"))

import os
import requests
from datetime import datetime, timedelta

def get_earnings_calendar():
	try:
		api_key = os.getenv("FINNHUB_API_KEY")
		if not api_key:
			raise Exception("Finnhub API key is not configured.")

		# Initialize the Finnhub client
		finnhub_client = finnhub.Client(api_key=api_key)

		today = datetime.now()
		next_week = today + timedelta(days=7)
		from_date = today.strftime('%Y-%m-%d')
		to_date = next_week.strftime('%Y-%m-%d')
		

		earnings_calendar = finnhub_client.earnings_calendar(from_date, to_date, symbol="")

		if not earnings_calendar or not earnings_calendar.get('earningsCalendar'):
			return []

		formatted_earnings = [
			{
				"ticker": event["symbol"],
				"date": event["date"],
				"hour": event["hour"],
				"epsEstimate": event["epsEstimate"]
			}
			for event in earnings_calendar.get("earningsCalendar", [])
			if event.get("symbol") and event.get("date")
		]

		return formatted_earnings

	except Exception as e:
		print(f"Failed to fetch Finnhub earnings calendar: {e}")
		return {"error": "Could not retrieve earnings data from Finnhub."}


def filter_dates(dates):
	today = datetime.today().date()
	cutoff_date = today + timedelta(days=45)
	
	sorted_dates = sorted(datetime.strptime(date, "%Y-%m-%d").date() for date in dates)

	arr = []
	for i, date in enumerate(sorted_dates):
		if date >= cutoff_date:
			arr = [d.strftime("%Y-%m-%d") for d in sorted_dates[:i+1]]  
			break
	
	if len(arr) > 0:
		if arr[0] == today.strftime("%Y-%m-%d"):
			return arr[1:]
		return arr

	raise ValueError("No date 45 days or more in the future found.")


def yang_zhang(price_data, window=30, trading_periods=252, return_last_only=True):
	log_ho = (price_data['High'] / price_data['Open']).apply(np.log)
	log_lo = (price_data['Low'] / price_data['Open']).apply(np.log)
	log_co = (price_data['Close'] / price_data['Open']).apply(np.log)
	
	log_oc = (price_data['Open'] / price_data['Close'].shift(1)).apply(np.log)
	log_oc_sq = log_oc**2
	
	log_cc = (price_data['Close'] / price_data['Close'].shift(1)).apply(np.log)
	log_cc_sq = log_cc**2
	
	rs = log_ho * (log_ho - log_co) + log_lo * (log_lo - log_co)
	
	close_vol = log_cc_sq.rolling(
		window=window,
		center=False
	).sum() * (1.0 / (window - 1.0))

	open_vol = log_oc_sq.rolling(
		window=window,
		center=False
	).sum() * (1.0 / (window - 1.0))

	window_rs = rs.rolling(
		window=window,
		center=False
	).sum() * (1.0 / (window - 1.0))

	k = 0.34 / (1.34 + ((window + 1) / (window - 1)) )
	result = (open_vol + k * close_vol + (1 - k) * window_rs).apply(np.sqrt) * np.sqrt(trading_periods)

	if return_last_only:
		return result.iloc[-1]
	else:
		return result.dropna()
	

def build_term_structure(days, ivs):
	days = np.array(days)
	ivs = np.array(ivs)

	sort_idx = days.argsort()
	days = days[sort_idx]
	ivs = ivs[sort_idx]


	spline = interp1d(days, ivs, kind='linear', fill_value="extrapolate")

	def term_spline(dte):
		if dte < days[0]:  
			return ivs[0]
		elif dte > days[-1]:
			return ivs[-1]
		else:  
			return float(spline(dte))

	return term_spline

def get_current_price(ticker):
	todays_data = ticker.history(period='1d')
	print(todays_data['Close'])
	return todays_data['Close'].iloc[0]

def compute_recommendation(ticker):
	try:
		ticker = ticker.strip().upper()
		if not ticker:
			return {'message': "Error: No stock symbol provided."}
		
		try:
			stock = yf.Ticker(ticker)
			if len(stock.options) == 0:
				raise KeyError()
		except KeyError:
			return {'message': f"Error: No options found for stock symbol '{ticker}'."}
		
		exp_dates = list(stock.options)
		try:
			exp_dates = filter_dates(exp_dates)
		except:
			return {'message': "Error: Not enough option data."}
		
		options_chains = {}
		for exp_date in exp_dates:
			options_chains[exp_date] = stock.option_chain(exp_date)
		
		try:
			underlying_price = get_current_price(stock)
			if underlying_price is None:
				raise ValueError("No market price found.")
		except Exception:
			return {'message': "Error: Unable to retrieve underlying stock price."}
		
		atm_iv = {}
		straddle = None 
		i = 0
		for exp_date, chain in options_chains.items():
			calls = chain.calls
			puts = chain.puts

			if calls.empty or puts.empty:
				continue

			call_diffs = (calls['strike'] - underlying_price).abs()
			call_idx = call_diffs.idxmin()
			call_iv = calls.loc[call_idx, 'impliedVolatility']

			put_diffs = (puts['strike'] - underlying_price).abs()
			put_idx = put_diffs.idxmin()
			put_iv = puts.loc[put_idx, 'impliedVolatility']

			atm_iv_value = (call_iv + put_iv) / 2.0
			atm_iv[exp_date] = atm_iv_value

			if i == 0:
				call_bid = calls.loc[call_idx, 'bid']
				call_ask = calls.loc[call_idx, 'ask']
				put_bid = puts.loc[put_idx, 'bid']
				put_ask = puts.loc[put_idx, 'ask']
				
				if call_bid is not None and call_ask is not None:
					call_mid = (call_bid + call_ask) / 2.0
				else:
					call_mid = None

				if put_bid is not None and put_ask is not None:
					put_mid = (put_bid + put_ask) / 2.0
				else:
					put_mid = None

				if call_mid is not None and put_mid is not None:
					straddle = (call_mid + put_mid)

			i += 1
		
		if not atm_iv:
			return {'message': "Error: Could not determine ATM IV for any expiration dates."}
		
		today = datetime.today().date()
		dtes = []
		ivs = []
		for exp_date, iv in atm_iv.items():
			exp_date_obj = datetime.strptime(exp_date, "%Y-%m-%d").date()
			days_to_expiry = (exp_date_obj - today).days
			dtes.append(days_to_expiry)
			ivs.append(iv)
		
		term_spline = build_term_structure(dtes, ivs)
		
		ts_slope_0_45 = (term_spline(45) - term_spline(dtes[0])) / (45-dtes[0])
		
		price_history = stock.history(period='3mo')
		iv30_rv30 = term_spline(30) / yang_zhang(price_history)

		avg_volume = price_history['Volume'].rolling(30).mean().dropna().iloc[-1]

		expected_move = str(round(straddle / underlying_price * 100,2)) + "%" if straddle else None

		rating = -1

		if avg_volume >= 1500000 and iv30_rv30 >= 1.25 and ts_slope_0_45 <= -0.00406:
			rating = 1
		elif avg_volume >= 1500000 and iv30_rv30 >= 1.25:
			rating = 0


		return {'message': "OK", 'avg_volume': avg_volume, 'iv30_rv30': iv30_rv30, 'ts_slope_0_45': ts_slope_0_45 , 'expected_move': expected_move, 'rating': rating}
	except Exception as e:
		return {'message': 'Error: Error occured processing'}