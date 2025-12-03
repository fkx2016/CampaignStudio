import json
import os
from sqlmodel import Session, select
from .database import engine, create_db_and_tables
from .models import CampaignPost

# Path to the old "Legacy" data
LEGACY_DATA_PATH = "../titles_and_hooks.json"

def import_legacy_data():
    print("--- Starting Legacy Data Import ---")
    
    # 1. Check if file exists
    if not os.path.exists(LEGACY_DATA_PATH):
        print(f"Error: Could not find {LEGACY_DATA_PATH}")
        return

    # 2. Read JSON
    with open(LEGACY_DATA_PATH, "r") as f:
        data = json.load(f)
    
    print(f"Found {len(data)} posts in legacy JSON.")

    # 3. Initialize DB
    create_db_and_tables()

    # 4. Insert into DB
    with Session(engine) as session:
        # Check if DB is already populated to avoid duplicates
        existing = session.exec(select(CampaignPost)).first()
        if existing:
            print("Database already contains data. Skipping import to avoid duplicates.")
            return

        for item in data:
            # Map JSON dict to SQLModel
            # Note: SQLModel is smart enough to handle the list/dict fields if we defined them as JSON columns
            post = CampaignPost(**item)
            session.add(post)
        
        session.commit()
        print("Success! All posts imported into SQLite.")

if __name__ == "__main__":
    import_legacy_data()
