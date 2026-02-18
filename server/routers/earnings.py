import yfinance as yf
import math
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from psycopg2.extras import RealDictCursor
from utils.database import get_db
from utils.earnings import get_earnings_calendar, compute_recommendation


router = APIRouter()
load_dotenv()
	
@router.get("/earnings")
async def get_all_earnings(db = Depends(get_db)):
	cursor = db.cursor(cursor_factory=RealDictCursor)

	cursor.execute("SELECT * FROM earnings")
	earnings_list = cursor.fetchall()
	cursor.close()
	return earnings_list

@router.post("/earnings", status_code=201)
async def post_next_week_earnings(db = Depends(get_db)):
	print("Adding to earnings table")

	cursor = db.cursor(cursor_factory=RealDictCursor)

	next_week_earnings = get_earnings_calendar()

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
				prediction = compute_recommendation(earning['ticker'])
				if prediction['message'].startswith('Error'):
					print(f"Error processing {earning['ticker']}: {prediction['message']}")
					continue
				try:
					val = prediction['expected_move']
					expected_move = float(str(val)[:-1]) if val is not None else 0.0
				except (ValueError, TypeError, AttributeError):
					expected_move = 0.0
				values = (
					expected_move,
					float(round(prediction['avg_volume'], ndigits=2)),
					float(round(prediction['iv30_rv30'], ndigits=10)),
					float(round(prediction['ts_slope_0_45'], ndigits=10)),
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
			prediction = compute_recommendation(earning['ticker'])
			if prediction['message'].startswith('Error'):
				print("no earnings for {0}".format(earning['ticker']))
				continue
			try:
				values = (earning['ticker'],
					earning['date'],
					earning['hour'],
					prediction['expected_move'][:-1],
					float(round(prediction['avg_volume'], ndigits=2)),
					float(round(prediction['iv30_rv30'], ndigits=10)),
					float(round(prediction['ts_slope_0_45'], ndigits=10)),
					float(round(earning['epsEstimate'], ndigits=2)),
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

@router.delete("/earnings")
async def delete_week_old_earnings(db = Depends(get_db)):
	print("Deleting earnings older than today")

	if db.closed != 0:
		raise HTTPException(status_code=500, detail="Could not connect to database")

	cursor = db.cursor(cursor_factory=RealDictCursor)

	cursor.execute("DELETE FROM earnings WHERE earnings_date < CURRENT_DATE;")
	db.commit()

	cursor.close()
	return {"message": "Successfully deleted old rows"}

@router.delete("/earnings/current")
async def delete_today_before_hour_earnings(db = Depends(get_db)):
	print("Deleting earnings before market today")

	cursor = db.cursor(cursor_factory=RealDictCursor)

	cursor.execute("DELETE FROM earnings WHERE earnings_date = CURRENT_DATE AND earnings_timing = 'bmo';")
	db.commit()

	cursor.close()
	return {"message": "Successfully deleted rows today's rows before market open"}
