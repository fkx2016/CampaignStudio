import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get DB URL from env, or default to SQLite for local dev fallback
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")

# Check if we are using SQLite (for connect_args)
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)
else:
    # PostgreSQL (Supabase) doesn't need check_same_thread
    engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
