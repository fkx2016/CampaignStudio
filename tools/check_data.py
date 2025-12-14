import sys
from pathlib import Path

# Add parent directory to path so we can import from backend
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session, select, create_engine
from backend.models import CampaignPost, Platform, User, Campaign

# Correct Local URL
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/campaignstudio"

engine = create_engine(DATABASE_URL)

def check_data():
    with Session(engine) as session:
        platforms = session.exec(select(Platform)).all()
        posts = session.exec(select(CampaignPost)).all()
        campaigns = session.exec(select(Campaign)).all()
        
        print(f"--- DATA CHECK REPORT ---")
        print(f"✅ Platforms: {len(platforms)}")
        if len(platforms) > 0:
            print(f"   Sample: {platforms[0].name}")
            
        print(f"✅ Campaigns: {len(campaigns)}")
        if len(campaigns) > 0:
            print(f"   Sample: {campaigns[0].name} (ID: {campaigns[0].id})")

        print(f"✅ Posts: {len(posts)}")
        if len(posts) > 0:
            print(f"   Sample: {posts[0].title} (Mode: {posts[0].mode})")
            
if __name__ == "__main__":
    check_data()
