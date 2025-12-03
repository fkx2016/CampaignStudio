import json
from sqlmodel import Session, select
from database import get_session, engine
from models import CampaignPost

def import_posts():
    print("🚀 Starting Import from titles_and_hooks.json...")
    
    # 1. Load JSON Data
    with open("titles_and_hooks.json", "r", encoding="utf-8") as f:
        posts_data = json.load(f)
        
    print(f"📦 Found {len(posts_data)} posts in file.")
    
    # 2. Connect to DB
    with Session(engine) as session:
        # Check existing count
        existing_count = session.exec(select(CampaignPost)).all()
        print(f"📊 Current DB Count: {len(existing_count)}")
        
        imported_count = 0
        for item in posts_data:
            # Check if ID exists to avoid duplicates
            existing = session.get(CampaignPost, item["id"])
            if existing:
                print(f"⚠️  Skipping ID {item['id']} (Already exists)")
                continue
                
            # Create Model
            # Note: We map JSON fields to Model fields. 
            # Luckily, the JSON structure seems to match our Model almost perfectly.
            post = CampaignPost(
                id=item["id"],
                title=item["title"],
                hook_text=item["hook_text"],
                category_primary=item["category_primary"],
                category_secondary=item.get("category_secondary", ""),
                category_tertiary=item.get("category_tertiary", ""),
                status=item.get("status", "Pending"),
                posted_date=item.get("posted_date", ""),
                meme_detail_expl=item.get("meme_detail_expl", ""),
                source_url=item.get("source_url", ""),
                media_image_url=item.get("media_image_url", ""),
                media_video_url=item.get("media_video_url", ""),
                closing_hook=item.get("closing_hook", ""),
                kc_approval=item.get("kc_approval", ""),
                target_platforms=item.get("target_platforms", []),
                platform_post_ids=item.get("platform_post_ids", []),
                performance_metrics=item.get("performance_metrics", {}),
                image_prompt=item.get("image_prompt", ""),
                video_prompt=item.get("video_prompt", "")
            )
            
            session.add(post)
            imported_count += 1
            
        session.commit()
        print(f"✅ Successfully imported {imported_count} new posts!")

if __name__ == "__main__":
    import_posts()
