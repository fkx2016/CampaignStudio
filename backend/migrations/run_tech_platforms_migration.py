#!/usr/bin/env python3
"""
Migration: Add tech platforms and platform guidance fields
"""
import os
import sys
from sqlalchemy import create_engine, text

# Get database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://campaign_user:campaign_pass@localhost:5433/campaign_db")

def run_migration():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Add new columns to platforms table
        print("Adding description and content_recommendations columns...")
        try:
            conn.execute(text("ALTER TABLE platform ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''"))
            conn.execute(text("ALTER TABLE platform ADD COLUMN IF NOT EXISTS content_recommendations TEXT DEFAULT ''"))
            conn.commit()
            print("✅ Columns added successfully")
        except Exception as e:
            print(f"⚠️  Column addition (may already exist): {e}")
        
        # Read and execute the SQL file
        print("\nAdding tech platforms...")
        sql_file = os.path.join(os.path.dirname(__file__), "add_tech_platforms.sql")
        with open(sql_file, 'r') as f:
            sql = f.read()
        
        try:
            conn.execute(text(sql))
            conn.commit()
            print("✅ Tech platforms added successfully")
        except Exception as e:
            print(f"❌ Error adding platforms: {e}")
            conn.rollback()
            return False
        
        # Verify
        print("\nVerifying platforms...")
        result = conn.execute(text("SELECT name, slug, is_active FROM platform ORDER BY id"))
        for row in result:
            status = "✓" if row[2] else "✗"
            print(f"  {status} {row[0]} ({row[1]})")
        
        print("\n✅ Migration complete!")
        return True

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
