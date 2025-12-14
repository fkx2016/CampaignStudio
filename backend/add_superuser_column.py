from sqlmodel import create_engine, text
from backend.database import DATABASE_URL

# Create engine (works for both SQLite and Postgres)
engine = create_engine(DATABASE_URL)

def add_column():
    print(f"🔌 Connecting to: {DATABASE_URL.split('@')[0]}...") # Hide password in logs
    
    with engine.connect() as connection:
        connection.begin()
        try:
            print("🛠️  Adding 'is_superuser' column...")
            connection.execute(text('ALTER TABLE "user" ADD COLUMN is_superuser BOOLEAN DEFAULT FALSE;'))
            connection.commit()
            print("✅ Column added successfully!")
        except Exception as e:
            print(f"⚠️  Error (maybe column exists?): {e}")
            
if __name__ == "__main__":
    add_column()
