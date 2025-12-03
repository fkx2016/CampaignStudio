from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .database import create_db_and_tables, get_session
from .models import CampaignPost, Platform

app = FastAPI()

# Allow Frontend to talk to Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SEED DATA
INITIAL_PLATFORMS = [
    {"name": "X (Twitter)", "slug": "x", "base_url": "https://twitter.com/compose/tweet", "icon": "Twitter", "char_limit": 280},
    {"name": "LinkedIn", "slug": "linkedin", "base_url": "https://www.linkedin.com/feed/", "icon": "Linkedin", "char_limit": 3000},
    {"name": "Facebook", "slug": "facebook", "base_url": "https://www.facebook.com/", "icon": "Facebook", "char_limit": 63206},
    {"name": "Instagram", "slug": "instagram", "base_url": "https://www.instagram.com/", "icon": "Instagram", "char_limit": 2200},
    {"name": "TikTok", "slug": "tiktok", "base_url": "https://www.tiktok.com/upload", "icon": "Video", "char_limit": 2200},
    {"name": "YouTube", "slug": "youtube", "base_url": "https://studio.youtube.com/", "icon": "Youtube", "char_limit": 5000},
    {"name": "Threads", "slug": "threads", "base_url": "https://www.threads.net/", "icon": "AtSign", "char_limit": 500},
    {"name": "Reddit", "slug": "reddit", "base_url": "https://www.reddit.com/submit", "icon": "MessageCircle", "char_limit": 40000},
    {"name": "Discord", "slug": "discord", "base_url": "https://discord.com/app", "icon": "MessageSquare", "char_limit": 2000},
    {"name": "Substack", "slug": "substack", "base_url": "https://substack.com/dashboard/post/new", "icon": "BookOpen", "char_limit": 100000},
    {"name": "Medium", "slug": "medium", "base_url": "https://medium.com/new-story", "icon": "Book", "char_limit": 100000},
    {"name": "Telegram", "slug": "telegram", "base_url": "https://web.telegram.org/", "icon": "Send", "char_limit": 4096},
    {"name": "WhatsApp", "slug": "whatsapp", "base_url": "https://web.whatsapp.com/", "icon": "Phone", "char_limit": 65536},
    {"name": "Pinterest", "slug": "pinterest", "base_url": "https://www.pinterest.com/pin-builder/", "icon": "Pin", "char_limit": 500},
    {"name": "Snapchat", "slug": "snapchat", "base_url": "https://web.snapchat.com/", "icon": "Ghost", "char_limit": 250},
    {"name": "Tumblr", "slug": "tumblr", "base_url": "https://www.tumblr.com/new", "icon": "Type", "char_limit": 100000},
    {"name": "Twitch", "slug": "twitch", "base_url": "https://dashboard.twitch.tv/", "icon": "Tv", "char_limit": 5000},
    {"name": "Truth Social", "slug": "truth", "base_url": "https://truthsocial.com/", "icon": "Flag", "char_limit": 500},
    {"name": "Gab", "slug": "gab", "base_url": "https://gab.com/", "icon": "MessageSquare", "char_limit": 3000},
    {"name": "Gettr", "slug": "gettr", "base_url": "https://gettr.com/", "icon": "Flame", "char_limit": 777},
    {"name": "Rumble", "slug": "rumble", "base_url": "https://rumble.com/upload.php", "icon": "Video", "char_limit": 5000},
    {"name": "Minds", "slug": "minds", "base_url": "https://www.minds.com/", "icon": "Brain", "char_limit": 5000},
    {"name": "Mastodon", "slug": "mastodon", "base_url": "https://mastodon.social/", "icon": "Server", "char_limit": 500},
    {"name": "Bluesky", "slug": "bluesky", "base_url": "https://bsky.app/", "icon": "Cloud", "char_limit": 300},
    {"name": "Ghost", "slug": "ghost", "base_url": "https://ghost.org/", "icon": "Ghost", "char_limit": 100000},
]

def seed_platforms():
    with Session(get_session().__next__().bind) as session:
        existing = session.exec(select(Platform)).first()
        if not existing:
            print("🌱 Seeding Platforms...")
            for p_data in INITIAL_PLATFORMS:
                platform = Platform(**p_data)
                session.add(platform)
            session.commit()
            print("✅ Platforms Seeded!")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_platforms()

@app.get("/")
def read_root():
    return {"message": "Campaign Poster API v2.0 is Live"}

# ... (Existing Post Routes) ...

# --- PLATFORM ROUTES ---

@app.get("/api/platforms", response_model=List[Platform])
def read_platforms(session: Session = Depends(get_session)):
    return session.exec(select(Platform)).all()

@app.put("/api/platforms/{platform_id}", response_model=Platform)
def update_platform(platform_id: int, platform_data: Platform, session: Session = Depends(get_session)):
    platform = session.get(Platform, platform_id)
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    
    p_dict = platform_data.dict(exclude_unset=True)
    for key, value in p_dict.items():
        setattr(platform, key, value)
        
    session.add(platform)
    session.commit()
    session.refresh(platform)
    return platform

# ... (Existing Upload Routes) ...

@app.get("/api/posts", response_model=List[CampaignPost])
def read_posts(mode: str = None, session: Session = Depends(get_session)):
    query = select(CampaignPost)
    if mode:
        query = query.where(CampaignPost.mode == mode)
    posts = session.exec(query).all()
    return posts

@app.get("/api/posts/{post_id}", response_model=CampaignPost)
def read_post(post_id: int, session: Session = Depends(get_session)):
    post = session.get(CampaignPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.post("/api/posts", response_model=CampaignPost)
def create_post(post: CampaignPost, session: Session = Depends(get_session)):
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@app.put("/api/posts/{post_id}", response_model=CampaignPost)
def update_post(post_id: int, post_data: CampaignPost, session: Session = Depends(get_session)):
    post = session.get(CampaignPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Update fields
    post_dict = post_data.dict(exclude_unset=True)
    for key, value in post_dict.items():
        setattr(post, key, value)
        
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

# --- FILE UPLOAD ---
import os
import uuid
import shutil
from fastapi import File, UploadFile
from fastapi.staticfiles import StaticFiles

# Ensure directory exists
UPLOAD_DIR = "backend/static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount Static Files so they are accessible via URL
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"http://localhost:8001/static/uploads/{unique_filename}"}
        
from pydantic import BaseModel

class ImageUrl(BaseModel):
    url: str

@app.post("/api/ingest-url")
async def ingest_url(image: ImageUrl):
    try:
        # 1. Download the image
        import requests
        response = requests.get(image.url, stream=True)
        response.raise_for_status()
        
        # 2. Generate Filename
        file_ext = ".png" # Default fallback
        if "jpeg" in response.headers.get("content-type", ""): file_ext = ".jpg"
        if "png" in response.headers.get("content-type", ""): file_ext = ".png"
        if "webp" in response.headers.get("content-type", ""): file_ext = ".webp"
        
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # 3. Save to Disk
        with open(file_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        return {"url": f"http://localhost:8001/static/uploads/{unique_filename}"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to ingest URL: {str(e)}")
