from typing import Annotated
from fastapi import FastAPI, Path, HTTPException, Depends
import yfinance as yf
import math
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
# from tensorflow.keras.models import load_model
import os

from routers import earnings

from routers.market import router as market_router
from routers.earnings import router as earnings_router
from routers.stock import router as stock_router
# from foodi.foodi import router as foodi_router

from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.include_router(market_router, prefix="/api")
app.include_router(earnings_router, prefix="/api")
app.include_router(stock_router, prefix="/api")
# app.include_router(foodi_router, prefix="/api")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chinny.net"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = None
    try:
        db_url = os.getenv("INTERNAL_DATABASE_URL")
        conn = psycopg2.connect(db_url)
        yield conn
    except Exception as e:
        print(f"Database Connection Error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")
    finally:
        if conn:
            conn.close()

@app.get("/")
async def root():
	return {"message": "Hello!"}


@app.get("/api/stocks/{stock}/currentPrice")
async def get_current_price(stock: Annotated[str, Path(title="The ticker to fetch")]):
	try:
		ticker = yf.Ticker(stock)
		info = ticker.info

		prev_close = info.get("regularMarketPrice")
		prev_close_percent = round(info.get("regularMarketChangePercent"), ndigits=2)

		if 'postMarketPrice' in info:
			post_price = info.get("postMarketPrice")
			post_price_percent = round(info.get("postMarketChangePercent"), ndigits=2)
			
			return {
				"post_price": post_price,
				"post_price_percent": post_price_percent,
				"last_price": prev_close,
				"last_price_percent": prev_close_percent,
				"source": "after-hours"
			}

		elif "preMarketPrice" in info:

			pre_price = info.get("preMarketPrice")
			pre_price_percent = round(info.get("preMarketChangePercent"), ndigits=2)
			return {
				"pre_price": pre_price,
				"pre_price_percent": pre_price_percent,
				"last_price": prev_close,
				"last_price_percent": prev_close_percent,
				"source": "before-hours"
			}
		else:
			return {
				"last_price": prev_close,
				"last_price_percent": prev_close_percent,
				"source": "during-hours"
			}

	except Exception as e:
		print(e)
		raise HTTPException(status_code=404, detail="Current price not found")
		

@app.get("/api/stocks/{stock}/earnings/prediction/")
async def get_earnings_prediction(stock: Annotated[str, Path(title="The ticker to fetch prediction about")]):
	return earnings.compute_recommendation(stock)

@app.get("/api/earnings")
async def get_all_earnings(db = Depends(get_db)):
	cursor = db.cursor(cursor_factory=RealDictCursor)

	cursor.execute("SELECT * FROM earnings")
	columns = [description[0] for description in cursor.description]
	earnings_list = [dict(zip(columns, row)) for row in cursor.fetchall()]
	cursor.close()
	return earnings_list

@app.post("/api/earnings", status_code=201)
async def post_next_week_earnings(db = Depends(get_db)):
	print("Adding to earnings table")

	cursor = db.cursor(cursor_factory=RealDictCursor)

	next_week_earnings = earnings.get_earnings_calendar()

	values = []
	rowCount = 0
	for earning in next_week_earnings:

		if earning['hour'] == '':
			continue
		
		try:
			# only companies over 50 billion market cap
			if yf.Ticker(earning['ticker']).fast_info['marketCap'] < 10_000_000_000:
				continue
		except Exception as e:
			print("Failed to find market cap data for " + earning['ticker'])
			print("SKIPPING")
			continue
		
		result = cursor.execute("SELECT * FROM earnings WHERE ticker = '{0}'".format(earning['ticker']))
		rows = cursor.fetchall()
		# Row doesnt exist, create it

		if (len(rows) == 1):
			try:
				prediction = earnings.compute_recommendation(earning['ticker'])
				if prediction['message'].startswith('Error'):
					print(f"Error processing {earning['ticker']}: {prediction['message']}")
					continue
				values = (
					prediction['expected_move'][:-1],
					round(prediction['avg_volume'], ndigits=2),
					round(prediction['iv30_rv30'], ndigits=10),
					round(prediction['ts_slope_0_45'], ndigits=10),
					prediction['rating'],
					earning['ticker']
				)
				command = "UPDATE earnings SET expected_move = %s, avg_volume = %s, iv30_rv30 = %s, ts_slope = %s, rating = %s WHERE ticker = %s"
				cursor.execute(command, values)
				db.commit()
				rowCount += 1
			except Exception as e:
				print(f"Error processing ticker {earning['ticker']}: {e}")
				print("Skipping ticker due to error")
		elif len(rows) == 0:
			prediction = earnings.compute_recommendation(earning['ticker'])
			if prediction['message'].startswith('Error'):
				print("no earnings for {0}".format(earning['ticker']))
				continue
			try:
				values = (earning['ticker'],
					earning['date'],
					earning['hour'],
					prediction['expected_move'][:-1],
					round(prediction['avg_volume'], ndigits=2),
					round(prediction['iv30_rv30'], ndigits=10),
					round(prediction['ts_slope_0_45'], ndigits=10),
					round(earning['epsEstimate'], ndigits=2),
					prediction['rating'])
				if math.isnan(prediction['ts_slope_0_45']):
					continue
				command = "INSERT INTO earnings (ticker, earnings_date, earnings_timing, expected_move, avg_volume, iv30_rv30, ts_slope, eps_estimate, rating) VALUES (%s,%s,%s,%s,%s,%s,%s,%s, %s)"
				cursor.execute(command, values)
				db.commit()
				rowCount +=1
			except Exception as e:
				print("Error processing ticker {0}".format(earning['ticker']))
				print(e)

	
		
	db.close()
	return {"message": f'Added {rowCount} rows'}

@app.delete("/api/earnings")
async def delete_week_old_earnings(db = Depends(get_db)):
	print("Deleting eanrings older than today")

	if db.closed != 0:
		raise HTTPException(status_code=500, detail="Could not connect to database")

	cursor = db.cursor(cursor_factory=RealDictCursor)

	cursor.execute("DELETE FROM earnings WHERE earnings_date < CURRENT_DATE;")
	db.commit()

	cursor.close()
	return {"message": f'Successfully deleted {0} rows'.format(cursor.rowcount)}