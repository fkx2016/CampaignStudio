import os
from sqlalchemy import create_engine, MetaData

# Port 5432 (default)
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/campaignstudio"

def wipe_database():
    print(f"CONNECTING TO: {DATABASE_URL}")
    try:
        engine = create_engine(DATABASE_URL)
        meta = MetaData()
        meta.reflect(bind=engine)
        
        print("DROPPING ALL TABLES...")
        meta.drop_all(bind=engine)
        
        print("✅ LOCAL DATABASE WIPED SUCCESSFULLY.")
        print("🚀 Now Restart your Backend to rebuild tables correctly.")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    wipe_database()
