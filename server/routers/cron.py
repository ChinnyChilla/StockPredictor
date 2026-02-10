from fastapi import APIRouter, Request, Depends, HTTPException
from utils.database import get_db
import routers.earnings as re

router = APIRouter()

@router.get("/cron/updateEarnings")
async def cron_job_fetch_earnings(request: Request, db=Depends(get_db)):
	if request.headers.get("user-agent") != "vercel-cron/1.0":
		raise HTTPException(status_code=401, detail="Unauthorized")
    
	await re.delete_week_old_earnings(db)
	
	await re.post_next_week_earnings(db)
	
	return {"status": "Cron completed: Updated earnings table"}

@router.get("/cron/deleteBeforeMarket")
async def cron_job_delete_before_market(request: Request, db=Depends(get_db)):
	if request.headers.get("user-agent") != "vercel-cron/1.0":
		raise HTTPException(status_code=401, detail="Unauthorized")
	
	await re.delete_today_before_hour_earnings(db)

	return {"status": "Cron completed: Deleted before hour earnings"}