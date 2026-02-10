import os
import psycopg2
from fastapi import HTTPException

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