import os
from sqlalchemy import create_engine, MetaData

# The Public URL you provided
DATABASE_URL = "postgresql://postgres:WmWGHrVJdVTpqZJmRzVMRqvCfUCwPaxu@shinkansen.proxy.rlwy.net:54002/railway"

def wipe_database():
    print(f"CONNECTING TO: {DATABASE_URL}")
    try:
        engine = create_engine(DATABASE_URL)
        meta = MetaData()
        meta.reflect(bind=engine)
        
        print("DROPPING ALL TABLES...")
        meta.drop_all(bind=engine)
        
        print("✅ DATABASE WIPED SUCCESSFULLY.")
        print("🚀 Now Restart your Railway Backend Service to rebuild tables correctly.")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    wipe_database()
