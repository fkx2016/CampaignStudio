from sqlmodel import Session, select
from backend.database import engine
from backend.models import User
from backend.auth import get_password_hash

def ensure_admin():
    print("Checking for admin user fkurka@gmail.com...")
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == "fkurka@gmail.com")).first()
        
        if user:
            print(f"✅ User found: {user.email}")
            print(f"   Current Status: Superuser={user.is_superuser}, Active={user.is_active}")
            
            # Reset password to strictly ensure it works
            user.hashed_password = get_password_hash("admin123")
            user.is_superuser = True
            user.is_active = True
            session.add(user)
            session.commit()
            session.refresh(user)
            print("🔄 Password RESET to 'admin123'")
            print("✅ Superuser privileges ENSURED")
        else:
            print("❌ User not found. Creating new admin...")
            new_user = User(
                email="fkurka@gmail.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Frank Kurka",
                is_active=True,
                is_superuser=True
            )
            session.add(new_user)
            session.commit()
            print("✨ Admin user CREATED with password 'admin123'")

if __name__ == "__main__":
    ensure_admin()
