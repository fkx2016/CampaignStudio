import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add backend to path to ensure we can load env if needed, though dotenv handles it
# We just need to be in the right directory or point to the right .env
# Assuming run from root or backend

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")
print(f"Migrating DB: {DATABASE_URL}")

if "sqlite" in DATABASE_URL:
    engine = create_engine(DATABASE_URL)
else:
    engine = create_engine(DATABASE_URL)

def run_migration():
    with engine.connect() as connection:
        trans = connection.begin()
        try:
            # 1. Add user_id to campaign
            print("Attempting to add user_id to 'campaign' table...")
            try:
                # Note: We are not adding the FOREIGN KEY constraint here to avoid SQLite complexity
                # The app logic will handle the relationship
                connection.execute(text("ALTER TABLE campaign ADD COLUMN user_id INTEGER"))
                print("✅ Added user_id to campaign")
            except Exception as e:
                if "duplicate column" in str(e) or "no such table" in str(e):
                    print(f"⚠️  Skipping campaign (Error: {e})")
                else:
                    print(f"⚠️  Error adding to campaign: {e}")

            # 2. Add user_id to campaignpost
            print("Attempting to add user_id to 'campaignpost' table...")
            try:
                connection.execute(text("ALTER TABLE campaignpost ADD COLUMN user_id INTEGER"))
                print("✅ Added user_id to campaignpost")
            except Exception as e:
                if "duplicate column" in str(e) or "no such table" in str(e):
                    print(f"⚠️  Skipping campaignpost (Error: {e})")
                else:
                    print(f"⚠️  Error adding to campaignpost: {e}")
            
            trans.commit()
            print("🎉 Migration complete.")
        except Exception as e:
            trans.rollback()
            print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
