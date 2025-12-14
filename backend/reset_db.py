from sqlmodel import SQLModel
from .database import engine, create_db_and_tables
from . import models # Import models so SQLModel knows about them

def fix_schema():
    print("🗑️  Dropping all tables...")
    SQLModel.metadata.drop_all(engine)
    print("✅ Tables dropped.")
    
    print("🌱 Recreating tables...")
    create_db_and_tables()
    print("✅ Tables recreated.")

if __name__ == "__main__":
    fix_schema()
