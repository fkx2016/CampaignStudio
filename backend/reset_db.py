from sqlmodel import create_engine, text
import os

# Database URL (Default to SQLite for local dev)
DATABASE_URL = "sqlite:///database.db"

engine = create_engine(DATABASE_URL)

def fix_schema():
    # For SQLite, we can just delete the file to be nuclear, 
    # but let's try dropping tables to be cleaner if we were on Postgres.
    # Since we are likely on SQLite locally, deleting the file is safest/easiest.
    
    if os.path.exists("database.db"):
        print("🗑️ Deleting old SQLite database...")
        os.remove("database.db")
        print("✅ Database deleted. Restart backend to recreate and seed.")
    else:
        print("⚠️ No database found. Restart backend to create.")

if __name__ == "__main__":
    fix_schema()
