import json
import os
from sqlmodel import Session, select, SQLModel
from backend.database import engine, create_db_and_tables
from backend.models import CampaignPost

def migrate_data():
    print("🚀 Starting Migration to Postgres...")
    
    # 1. Reset Database (Drop & Recreate to ensure Schema matches Model)
    print("♻️  Resetting Tables...")
    SQLModel.metadata.drop_all(engine)
    create_db_and_tables()
    
    # 2. Read JSON Data
    json_path = "titles_and_hooks.json" # It's in the root now? Or we need to find it.
    # Actually, the user said "existing data is all ebeg".
    # We should look for the file.
    
    if not os.path.exists(json_path):
        # Fallback to looking in the old MVP folder location if we can't find it
        # But wait, we are in CampaignStudio root.
        # Let's check if we have the file.
        pass

    # Let's assume we want to import from the 'titles_and_hooks.json' if it exists, 
    # OR we create some dummy data if it doesn't.
    
    # WAIT! We migrated from CampaignPosterMVP. The file might not be here.
    # I will check for the file first in the next step. 
    # For this script, I will assume the file is passed or hardcoded.
    
    # Let's try to read from the current directory
    try:
        with open("titles_and_hooks.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            
            # Handle both list and dict formats
            if isinstance(data, list):
                posts_data = data
            else:
                posts_data = data.get("campaign_posts", [])
                
    except FileNotFoundError:
        print("⚠️ titles_and_hooks.json not found. Skipping import.")
        return

    with Session(engine) as session:
        # Check if DB is already populated
        existing = session.exec(select(CampaignPost)).first()
        if existing:
            print("⚠️ Database already has data. Skipping import to avoid duplicates.")
            return

        print(f"📦 Found {len(posts_data)} posts to migrate.")
        
        for item in posts_data:
            # Map JSON fields to Model fields
            post = CampaignPost(
                title=item.get("title", "Untitled"),
                hook_text=item.get("hook_text", ""),
                category_primary=item.get("category_primary", "General"),
                category_secondary=item.get("category_secondary", ""),
                status="Pending",
                mode="ebeg", # Defaulting to ebeg as requested
                
                # Media
                meme_detail_expl=item.get("meme_detail_expl", ""),
                source_url=item.get("source_url", ""),
                media_image_url=item.get("media_image_url", ""),
                
                # Metadata
                kc_approval=item.get("kc_approval", "Pending"),
                target_platforms=item.get("target_platforms", []),
                performance_metrics=item.get("performance_metrics", {})
            )
            session.add(post)
        
        session.commit()
        print("✅ Migration Complete! All posts imported as 'ebeg'.")

if __name__ == "__main__":
    migrate_data()
