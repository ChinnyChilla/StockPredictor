from fastapi import FastAPI
from dotenv import load_dotenv

from routers.market import router as market_router
from routers.earnings import router as earnings_router
from routers.stock import router as stock_router
from routers.cron import router as cron_router
from routers.stock_options import router as option_router

from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.include_router(market_router, prefix="/api")
app.include_router(earnings_router, prefix="/api")
app.include_router(stock_router, prefix="/api")
app.include_router(cron_router, prefix="/api")
app.include_router(option_router, prefix="/api")
# app.include_router(foodi_router, prefix="/api")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chinny.net", "https://www.chinny.net", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
	return {"message": "Hello!"}
