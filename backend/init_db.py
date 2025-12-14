from sqlmodel import SQLModel, Session, select
from backend.database import engine
# Import all models to ensure SQLModel can build the registry
from backend.models import User, Campaign, CampaignPost, Platform, WorkspaceSettings, Mode 
from passlib.context import CryptContext

def init_db():
    print("🏗️  Factory Status: Checking Tables...")
    # This is the Magic Line: It creates tables if they don't exist, and skips them if they do.
    SQLModel.metadata.create_all(engine)
    print("✅ Tables Verified.")

    print("👑 Factory Status: Checking Admin...")
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    with Session(engine) as session:
        # Check for existing admin
        user = session.exec(select(User).where(User.email == "admin@campaignstudio.com")).first()
        
        if not user:
            print("🔨 Creating Superuser...")
            admin_user = User(
                email="admin@campaignstudio.com",
                hashed_password=pwd_context.hash("admin123"), # Default Password
                full_name="System Admin",
                is_active=True,
                is_superuser=True
            )
            session.add(admin_user)
            session.commit()
            print("✅ SUCCESS: Superuser created!")
            print("🔑 Login: admin@campaignstudio.com / admin123")
        else:
            print("ℹ️  Superuser already exists.")

if __name__ == "__main__":
    init_db()
