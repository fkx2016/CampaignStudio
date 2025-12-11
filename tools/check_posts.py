from sqlmodel import Session, select
from backend.database import engine
from backend.models import CampaignPost

def check_posts():
    with Session(engine) as session:
        posts = session.exec(select(CampaignPost).where(CampaignPost.campaign_id == 1)).all()
        print(f"🔎 Found {len(posts)} posts for Campaign ID 1:")
        for p in posts[:5]:
            print(f"   - {p.title} (ID: {p.id}, Mode: {p.mode})")

if __name__ == "__main__":
    check_posts()
