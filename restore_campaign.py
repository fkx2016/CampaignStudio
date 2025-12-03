import json
from sqlmodel import Session, select
from backend.database import engine
from backend.models import CampaignPost, Campaign, Mode

def restore_original_campaign():
    print("🚀 Starting Restoration of Original Campaign...")
    
    # 1. Load JSON Data
    with open("titles_and_hooks.json", "r", encoding="utf-8") as f:
        posts_data = json.load(f)
        
    print(f"📦 Found {len(posts_data)} posts in source file.")
    
    with Session(engine) as session:
        # 0. Fix Database Sequence (Critical for Postgres)
        # Since we previously inserted IDs manually, the auto-increment counter is lagging.
        # We must fast-forward it to the max existing ID.
        print("🔧 Fixing Database Sequence...")
        from sqlalchemy import text
        try:
            session.exec(text("SELECT setval(pg_get_serial_sequence('campaignpost', 'id'), coalesce(max(id), 0)+1, false) FROM campaignpost"))
            session.commit()
        except Exception as e:
            print(f"⚠️  Sequence fix warning (might be SQLite?): {e}")

        # 2. Get the Target "Original" Campaign
        # We'll create a specific "Original Donation Drive" campaign under "ebeg" mode
        mode = session.exec(select(Mode).where(Mode.slug == "ebeg")).first()
        if not mode:
            print("❌ Error: 'ebeg' mode not found. Please run the main importer first.")
            return

        campaign_name = "Original Donation Drive"
        campaign = session.exec(select(Campaign).where(Campaign.name == campaign_name)).first()
        
        if not campaign:
            print(f"✨ Creating new '{campaign_name}' campaign...")
            campaign = Campaign(name=campaign_name, mode_id=mode.id, description="Restored original dataset")
            session.add(campaign)
            session.commit()
            session.refresh(campaign)
        else:
            print(f"ℹ️  Found existing '{campaign_name}' campaign (ID: {campaign.id})")

        # 3. Restore Posts
        restored_count = 0
        skipped_count = 0
        
        for item in posts_data:
            # Check if this post content already exists IN THIS CAMPAIGN
            # We check by title to avoid duplicating if we run this script multiple times
            existing_in_campaign = session.exec(
                select(CampaignPost)
                .where(CampaignPost.campaign_id == campaign.id)
                .where(CampaignPost.title == item["title"])
            ).first()
            
            if existing_in_campaign:
                skipped_count += 1
                continue

            # Create a NEW copy of the post linked to this campaign
            # We do NOT use the original ID, as that might be taken by the "dummy" copy
            post = CampaignPost(
                title=item["title"],
                hook_text=item["hook_text"],
                category_primary=item.get("category_primary", "General"),
                category_secondary=item.get("category_secondary", ""),
                category_tertiary=item.get("category_tertiary", ""),
                status="Pending", # Reset status for the fresh copy
                mode=mode.slug,
                campaign_id=campaign.id,
                
                # Copy other fields
                meme_detail_expl=item.get("meme_detail_expl", ""),
                source_url=item.get("source_url", ""),
                media_image_url=item.get("media_image_url", ""),
                media_video_url=item.get("media_video_url", ""),
                closing_hook=item.get("closing_hook", ""),
                kc_approval=item.get("kc_approval", ""),
                target_platforms=item.get("target_platforms", []),
                platform_post_ids=[], # Reset platform IDs as this is a fresh copy
                performance_metrics={},
                image_prompt=item.get("image_prompt", ""),
                video_prompt=item.get("video_prompt", "")
            )
            
            session.add(post)
            restored_count += 1
            
        session.commit()
        print(f"✅ Restoration Complete!")
        print(f"   - {restored_count} posts restored to '{campaign_name}'")
        print(f"   - {skipped_count} posts skipped (already in campaign)")

if __name__ == "__main__":
    restore_original_campaign()
