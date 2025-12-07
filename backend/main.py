from typing import List
import os
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
import uuid
import shutil
from pydantic import BaseModel

from .database import create_db_and_tables, get_session
from .models import CampaignPost, Platform, WorkspaceSettings, Mode, Campaign, User
from .enums import PostStatus, CampaignStatus, ModeSlug
from . import auth
from .auth import get_current_active_user

app = FastAPI()

# Include Auth Router
app.include_router(auth.router, prefix="/auth")

# Allow Frontend to talk to Backend
# Get allowed origins from environment variable, default to "*" for dev convenience if not set
# In production, this MUST be set to the frontend domain (e.g. https://campaign-studio.vercel.app)
origins_str = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    {"name": "Telegram", "slug": "telegram", "base_url": "https://web.telegram.org/", "icon": "Send", "char_limit": 4096},
    {"name": "WhatsApp", "slug": "whatsapp", "base_url": "https://web.whatsapp.com/", "icon": "Phone", "char_limit": 65536},
    {"name": "Pinterest", "slug": "pinterest", "base_url": "https://www.pinterest.com/pin-builder/", "icon": "Pin", "char_limit": 500},
    {"name": "Snapchat", "slug": "snapchat", "base_url": "https://web.snapchat.com/", "icon": "Ghost", "char_limit": 250},
    {"name": "Threads", "slug": "threads", "base_url": "https://www.threads.net/", "icon": "AtSign", "char_limit": 500},
    {"name": "Bluesky", "slug": "bluesky", "base_url": "https://bsky.app/", "icon": "Cloud", "char_limit": 300},
    {"name": "Ghost", "slug": "ghost", "base_url": "https://ghost.org/", "icon": "Ghost", "char_limit": 100000},
    {"name": "Substack", "slug": "substack", "base_url": "https://substack.com/dashboard/post/new", "icon": "BookOpen", "char_limit": 100000},
    {"name": "Medium", "slug": "medium", "base_url": "https://medium.com/new-story", "icon": "Book", "char_limit": 100000},
    {"name": "Reddit", "slug": "reddit", "base_url": "https://www.reddit.com/submit", "icon": "MessageCircle", "char_limit": 40000},
    {"name": "Discord", "slug": "discord", "base_url": "https://discord.com/app", "icon": "MessageSquare", "char_limit": 2000},
    {"name": "Gab", "slug": "gab", "base_url": "https://gab.com/", "icon": "MessageSquare", "char_limit": 3000},
    {"name": "Gettr", "slug": "gettr", "base_url": "https://gettr.com/", "icon": "Flame", "char_limit": 777},
    {"name": "Rumble", "slug": "rumble", "base_url": "https://rumble.com/upload.php", "icon": "Video", "char_limit": 5000},
    {"name": "Minds", "slug": "minds", "base_url": "https://www.minds.com/", "icon": "Brain", "char_limit": 5000},
    {"name": "Mastodon", "slug": "mastodon", "base_url": "https://mastodon.social/", "icon": "Server", "char_limit": 500},
]

INITIAL_MODES = [
    {
        "name": "Donation / E-Begging",
        "slug": ModeSlug.EBEG,
        "description": "Empathetic storytelling with clear financial asks.",
        "tone_guidelines": "Vulnerable, urgent, grateful. Focus on the 'why'.",
        "structure_template": "Hook (The Need) -> Story (The Context) -> Ask (The Solution) -> Gratitude",
    },
    {
        "name": "Political / Activism",
        "slug": ModeSlug.POLITICAL,
        "description": "Provocative engagement and Socratic questioning.",
        "tone_guidelines": "Bold, questioning, rallying. Challenge the status quo.",
        "structure_template": "Hook (The Injustice) -> Evidence (The Facts) -> Question (The Shift) -> CTA",
    },
    {
        "name": "Content / Thought Leadership",
        "slug": ModeSlug.CONTENT,
        "description": "High-value educational content to build authority.",
        "tone_guidelines": "Helpful, knowledgeable, clear. Teach, don't preach.",
        "structure_template": "Hook (The Insight) -> Explanation (The How-To) -> Example (The Proof) -> Summary",
    },
    {
        "name": "Promotion / Sales",
        "slug": ModeSlug.PROMOTION,
        "description": "Excitement-building for events or launches.",
        "tone_guidelines": "High energy, exclusive, urgent. Use FOMO.",
        "structure_template": "Hook (The Big News) -> Details (The What/When) -> Scarcity (The Why Now) -> CTA",
    },
    {
        "name": "Awareness / Viral",
        "slug": ModeSlug.AWARENESS,
        "description": "Broad appeal content designed for maximum sharing.",
        "tone_guidelines": "Relatable, emotional, surprising. Aim for the 'Whoa' factor.",
        "structure_template": "Hook (The Surprise) -> Story (The Emotion) -> Twist (The Insight) -> Share Ask",
    },
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

def seed_modes():
    with Session(get_session().__next__().bind) as session:
        existing = session.exec(select(Mode)).first()
        if not existing:
            print("🌱 Seeding Modes...")
            for m_data in INITIAL_MODES:
                mode = Mode(**m_data)
                session.add(mode)
            session.commit()
            print("✅ Modes Seeded!")

def seed_settings():
    with Session(get_session().__next__().bind) as session:
        existing = session.exec(select(WorkspaceSettings)).first()
        if not existing:
            print("🌱 Seeding Settings...")
            settings = WorkspaceSettings(id=1) # Default values from model
            session.add(settings)
            session.commit()
            print("✅ Settings Seeded!")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_platforms()
    seed_modes()
    seed_settings()

@app.get("/")
def read_root():
    return {"message": "I AM LIVE AND EDITED 12345"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/system-info")
def get_system_info():
    db_url = os.environ.get("DATABASE_URL", "")
    
    db_type = "Unknown"
    if "sqlite" in db_url:
        db_type = "SQLite (Local File)"
    elif "postgres" in db_url:
        if "supabase" in db_url:
            db_type = "Supabase (Cloud)"
        elif "db" in db_url or "localhost" in db_url:
            db_type = "Local Docker (Postgres)"
        else:
            db_type = "Postgres (Remote)"
            
    return {
        "version": "2.0.0",
        "database_type": db_type,
        "environment": "Development" if "dev" in os.environ.get("ENV", "dev") else "Production"
    }

# --- SETTINGS ROUTES ---

@app.get("/api/settings", response_model=WorkspaceSettings)
def read_settings(session: Session = Depends(get_session)):
    settings = session.exec(select(WorkspaceSettings)).first()
    if not settings:
        # Fallback if seed failed for some reason
        return WorkspaceSettings(id=1)
    return settings

@app.put("/api/settings", response_model=WorkspaceSettings)
def update_settings(settings_data: WorkspaceSettings, session: Session = Depends(get_session)):
    settings = session.exec(select(WorkspaceSettings)).first()
    if not settings:
        settings = WorkspaceSettings(id=1)
        session.add(settings)
    
    s_dict = settings_data.dict(exclude_unset=True)
    for key, value in s_dict.items():
        if key != "id": # Protect ID
            setattr(settings, key, value)
            
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings

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
    session.refresh(platform)
    return platform

# --- MODE ROUTES ---

@app.get("/api/modes", response_model=List[Mode])
def read_modes(session: Session = Depends(get_session)):
    return session.exec(select(Mode)).all()

@app.post("/api/modes", response_model=Mode)
def create_mode(mode: Mode, session: Session = Depends(get_session)):
    session.add(mode)
    session.commit()
    session.refresh(mode)
    return mode

# --- CAMPAIGN ROUTES ---

@app.get("/api/campaigns", response_model=List[Campaign])
def read_campaigns(
    mode_slug: str = None, 
    session: Session = Depends(get_session),
    # current_user: User = Depends(get_current_active_user) # TEMPORARY DISABLE
):
    # If no user, fetch ALL (for debugging) or fetch for user ID 1?
    # Let's try fetching ALL campaigns to see if data exists at all.
    query = select(Campaign) 
    if mode_slug:
        query = query.join(Mode).where(Mode.slug == mode_slug)
    return session.exec(query).all()

@app.post("/api/campaigns", response_model=Campaign)
def create_campaign(
    campaign: Campaign, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    campaign.user_id = current_user.id
    session.add(campaign)
    session.commit()
    session.refresh(campaign)
    return campaign

# ... (Existing Upload Routes) ...

@app.get("/api/posts", response_model=List[CampaignPost])
def read_posts(
    mode: str = None, 
    session: Session = Depends(get_session),
    # current_user: User = Depends(get_current_active_user) # TEMPORARY DISABLE
):
    # Filter by user via Campaign relationship or direct user_id
    # Since we added user_id to Post, we can use that directly
    # query = select(CampaignPost).where(CampaignPost.user_id == current_user.id)
    query = select(CampaignPost) # DEBUG: Fetch ALL posts
    
    if mode:
        query = query.where(CampaignPost.mode == mode)
    posts = session.exec(query).all()
    return posts

@app.get("/api/posts/{post_id}", response_model=CampaignPost)
def read_post(
    post_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    post = session.get(CampaignPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to access this post")
    return post

@app.post("/api/posts", response_model=CampaignPost)
def create_post(
    post: CampaignPost, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    post.user_id = current_user.id
    
    # Auto-link to Campaign if missing
    if not post.campaign_id:
        # 1. Find Mode
        mode_slug = post.mode or ModeSlug.EBEG
        mode = session.exec(select(Mode).where(Mode.slug == mode_slug)).first()
        if mode:
            # 2. Find/Create Campaign (Scoped to User!)
            campaign_name = post.category_primary or "General"
            campaign = session.exec(
                select(Campaign)
                .where(Campaign.name == campaign_name)
                .where(Campaign.user_id == current_user.id)
            ).first()
            
            if not campaign:
                campaign = Campaign(name=campaign_name, mode_id=mode.id, user_id=current_user.id)
                session.add(campaign)
                session.commit()
                session.refresh(campaign)
            
            post.campaign_id = campaign.id
            
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@app.put("/api/posts/{post_id}", response_model=CampaignPost)
def update_post(
    post_id: int, 
    post_data: CampaignPost, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    post = session.get(CampaignPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")
    
    # Update fields
    post_dict = post_data.dict(exclude_unset=True)
    for key, value in post_dict.items():
        if key != "user_id": # Prevent transferring ownership via API for now
            setattr(post, key, value)
        
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

# --- AI ROUTES ---
from .ai.optimizer import OptimizationRequest, OptimizationResponse, simple_optimize

@app.post("/api/ai/optimize", response_model=OptimizationResponse)
def optimize_text(request: OptimizationRequest, session: Session = Depends(get_session)):
    # In the future, we can use 'session' to look up Mode details
    return simple_optimize(request)

# --- FILE UPLOAD ---

# Ensure directory exists
UPLOAD_DIR = "backend/static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount Static Files so they are accessible via URL
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

# Helper to get base URL
def get_base_url():
    # In production, this should be set to the backend URL (e.g. https://api.campaignstudio.com)
    # If not set, it falls back to localhost for development
    return os.getenv("API_BASE_URL", "http://localhost:8001")

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    base_url = get_base_url()
    return {"url": f"{base_url}/static/uploads/{unique_filename}"}
        

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
                
        base_url = get_base_url()
        return {"url": f"{base_url}/static/uploads/{unique_filename}"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to ingest URL: {str(e)}")

# --- SAMPLE DATA SEEDING ---

SAMPLE_POSTS = [
    {
        "title": "Medical Emergency Fund",
        "hook_text": "I never thought I'd be the one asking for help. But when the doctor said 'surgery', my world stopped. We are $5,000 short of saving my best friend's life. Here is the breakdown of costs...",
        "mode": ModeSlug.EBEG,
        "category_primary": "Medical",
        "status": PostStatus.PENDING,
        "media_image_url": "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "title": "Community Garden Initiative",
        "hook_text": "They want to turn our park into a parking lot. Not on my watch. We have 48 hours to sign this petition and show City Hall that green spaces matter more than concrete. Will you stand with us?",
        "mode": ModeSlug.POLITICAL,
        "category_primary": "Local Activism",
        "status": PostStatus.PENDING,
        "media_image_url": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "title": "5 Tips for Remote Work",
        "hook_text": "Stop working from your bed. Seriously. It's killing your back and your productivity. Here are the 5 non-negotiable rules I used to triple my output while working from home... #RemoteWork #Productivity",
        "mode": ModeSlug.CONTENT,
        "category_primary": "Productivity",
        "status": PostStatus.POSTED,
        "media_image_url": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "title": "Flash Sale Announcement",
        "hook_text": "⚠️ WARNING: This sells out every year in 20 minutes. The Black Friday bundle is LIVE. If you want the masterclass + the templates for 90% off, you need to click this link right now.",
        "mode": ModeSlug.PROMOTION,
        "category_primary": "Sales",
        "status": PostStatus.PENDING,
        "media_image_url": "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "title": "The Truth About AI",
        "hook_text": "Everyone is scared AI will replace them. They are wrong. A *human* using AI will replace them. The train is leaving the station. Are you on board, or are you on the tracks?",
        "mode": ModeSlug.AWARENESS,
        "category_primary": "Tech Trends",
        "status": PostStatus.PENDING,
        "media_image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000"
    }
]

@app.post("/api/seed-samples")
def seed_samples(session: Session = Depends(get_session)):
    # Try to get user, or fallback
    # We can't use Depends(get_current_active_user) because it raises 401.
    # So we will just fetch User ID 1 (Demo User) if we want.
    
    # Ideally, we should require a user. But if "Launch Demo" is clicked by a guest...
    # Let's create a temporary guest user?
    
    # For now, let's assume we fetch the FIRST user in DB, or create one.
    user = session.exec(select(User)).first()
    if not user:
        # Create Demo User
        user = User(email="demo@example.com", password_hash="demo", is_active=True, full_name="Demo User")
        session.add(user)
        session.commit()
        session.refresh(user)
        
    target_user_id = user.id
    
    count = 0
    
    # 1. Fetch all Modes to look up IDs
    modes = session.exec(select(Mode)).all()
    mode_map = {m.slug: m for m in modes}

    if not mode_map:
        return {"message": "Modes not seeded yet", "count": 0}

    for p_data in SAMPLE_POSTS:
        # Check by Title AND User (allow multiple users to have samples)
        existing = session.exec(
            select(CampaignPost)
            .where(CampaignPost.title == p_data["title"])
            .where(CampaignPost.campaign_id.in_(
                select(Campaign.id).where(Campaign.user_id == target_user_id)
            ))
        ).first()

        if not existing:
            # 2. Get the correct Mode ID
            post_mode_slug = p_data["mode"]
            if post_mode_slug not in mode_map:
                continue 
                
            mode_obj = mode_map[post_mode_slug]
            
            # 3. Find/Create Campaign for THIS USER
            camp_name = f"Sample {mode_obj.name}"
            campaign = session.exec(
                select(Campaign)
                .where(Campaign.name == camp_name)
                .where(Campaign.user_id == target_user_id)
            ).first()
            
            if not campaign:
                campaign = Campaign(
                    name=camp_name, 
                    mode_id=mode_obj.id, 
                    status=CampaignStatus.ACTIVE,
                    user_id=target_user_id  # <--- CRITICAL FIX
                )
                session.add(campaign)
                session.commit()
                session.refresh(campaign)
            
            # 4. Create Post
            post = CampaignPost(**p_data)
            post.campaign_id = campaign.id
            session.add(post)
            count += 1
    
    session.commit()
    return {"message": f"Successfully seeded {count} sample posts!", "count": count}

@app.post("/api/force-seed-platforms")
def force_seed_platforms(session: Session = Depends(get_session)):
    """Force re-seeding of all platforms if they are missing."""
    count = 0
    updated = 0
    for p_data in INITIAL_PLATFORMS:
        # Check by SLUG (unique identifier)
        existing = session.exec(select(Platform).where(Platform.slug == p_data["slug"])).first()
        if not existing:
            platform = Platform(**p_data)
            session.add(platform)
            count += 1
        else:
            # Optional: Update existing definitions if code changed
            for k, v in p_data.items():
                setattr(existing, k, v)
            session.add(existing)
            updated += 1
            
    session.commit()
    return {
        "message": "Platform seeding complete",
        "added": count,
        "updated": updated,
        "total_platforms": len(INITIAL_PLATFORMS)
    }
