import json
from sqlmodel import Session, select
from database import get_session, engine
from models import CampaignPost, Campaign, Mode

def get_or_create_mode(session: Session, name: str, slug: str, description: str):
    mode = session.exec(select(Mode).where(Mode.slug == slug)).first()
    if not mode:
        print(f"✨ Creating Mode: {name}")
        mode = Mode(name=name, slug=slug, description=description)
        session.add(mode)
        session.commit()
        session.refresh(mode)
    return mode

def get_or_create_campaign(session: Session, name: str, mode_id: int):
    campaign = session.exec(select(Campaign).where(Campaign.name == name)).first()
    if not campaign:
        print(f"✨ Creating Campaign: {name}")
        campaign = Campaign(name=name, mode_id=mode_id)
        session.add(campaign)
        session.commit()
        session.refresh(campaign)
    return campaign

def import_posts():
    print("🚀 Starting Import from titles_and_hooks.json...")
    
    # 1. Load JSON Data
    with open("titles_and_hooks.json", "r", encoding="utf-8") as f:
        posts_data = json.load(f)
        
    print(f"📦 Found {len(posts_data)} posts in file.")
    
    # 2. Connect to DB
    with Session(engine) as session:
        # A. Ensure Modes Exist
        donation_mode = get_or_create_mode(session, "Donation", "ebeg", "Asking for support/funds.")
        content_mode = get_or_create_mode(session, "Content Leadership", "content", "Thought leadership and humor.")
        promo_mode = get_or_create_mode(session, "Promotion Sales", "promo", "Selling products/services.")
        political_mode = get_or_create_mode(session, "Political", "political", "Political commentary.")
        
        # Check existing count
        existing_count = session.exec(select(CampaignPost)).all()
        print(f"📊 Current DB Count: {len(existing_count)}")
        
        imported_count = 0
        for item in posts_data:
            # Check if ID exists to avoid duplicates
            existing = session.get(CampaignPost, item["id"])
            if existing:
                # Optional: Update existing post with new campaign logic if needed
                # For now, we skip to avoid overwriting user edits
                print(f"⚠️  Skipping ID {item['id']} (Already exists)")
                continue
                
            # B. Determine Mode & Campaign
            category = item.get("category_primary", "General")
            
            # Simple Heuristic for Mode Mapping
            if "Humor" in category or "Meme" in category:
                target_mode = content_mode
            elif "Promotion" in category:
                target_mode = promo_mode
            elif "Political" in category:
                target_mode = political_mode
            else:
                target_mode = donation_mode # Default to Donation
            
            # C. Get/Create Campaign
            # We use the Category Name as the Campaign Name
            campaign = get_or_create_campaign(session, category, target_mode.id)

            # Create Model
            post = CampaignPost(
                id=item["id"],
                title=item["title"],
                hook_text=item["hook_text"],
                category_primary=category,
                category_secondary=item.get("category_secondary", ""),
                category_tertiary=item.get("category_tertiary", ""),
                status=item.get("status", "Pending"),
                posted_date=item.get("posted_date", ""),
                mode=target_mode.slug, # Keep the string for legacy UI compatibility
                campaign_id=campaign.id, # Link to the new Campaign entity
                
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
