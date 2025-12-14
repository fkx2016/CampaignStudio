from sqlmodel import Session, select
from backend.database import engine
from backend.models import Campaign, Mode, ModeSlug

def check_data():
    with Session(engine) as session:
        # 1. Check Mode
        mode = session.exec(select(Mode).where(Mode.slug == "ebeg")).first()
        if not mode:
            print("❌ Mode 'ebeg' NOT FOUND")
            return
        print(f"✅ Mode Found: {mode.name} (ID: {mode.id})")

        # 2. Check Campaigns linked to this Mode
        campaigns = session.exec(select(Campaign).where(Campaign.mode_id == mode.id)).all()
        print(f"🔎 Found {len(campaigns)} campaigns for mode 'ebeg':")
        for c in campaigns:
            print(f"   - {c.name} (ID: {c.id}, Status: {c.status})")

        # 3. Check if any campaigns exist at all
        all_campaigns = session.exec(select(Campaign)).all()
        print(f"📊 Total Campaigns in DB: {len(all_campaigns)}")
        if len(all_campaigns) > 0 and len(campaigns) == 0:
            print("⚠️ Campaigns exist but are not linked to 'ebeg' mode correctly.")
            for c in all_campaigns:
                 print(f"   - {c.name} (Mode ID: {c.mode_id})")

if __name__ == "__main__":
    check_data()
