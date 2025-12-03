from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .database import create_db_and_tables, get_session
from .models import CampaignPost

app = FastAPI()

# Allow Frontend to talk to Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Campaign Poster API v2.0 is Live"}

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
