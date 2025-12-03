from typing import List, Optional, Dict, Any
from sqlmodel import Field, SQLModel, JSON, Column
from datetime import datetime

class CampaignPost(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    hook_text: str
    category_primary: str
    category_secondary: Optional[str] = ""
    category_tertiary: Optional[str] = ""
    status: str = Field(default="Pending") # Pending, Posted
    mode: str = Field(default="ebeg") # ebeg, content, promotion, political
    posted_date: Optional[str] = ""
    
    # Media & Content
    meme_detail_expl: Optional[str] = ""
    source_url: Optional[str] = ""
    media_image_url: Optional[str] = ""
    media_video_url: Optional[str] = ""
    closing_hook: Optional[str] = ""
    
    # Metadata (Stored as JSON for flexibility in SQLite/Postgres)
    kc_approval: Optional[str] = ""
    
    # We use sa_column=Column(JSON) to tell SQLModel to treat these as JSON
    # Note: In SQLite this is stored as Text, in Postgres as JSONB
    target_platforms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    platform_post_ids: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    performance_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # AI Prompts
    image_prompt: Optional[str] = ""
    video_prompt: Optional[str] = ""

class Platform(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    slug: str = Field(index=True, unique=True) # e.g. 'x', 'linkedin', 'instagram'
    base_url: str # The URL to open for posting
    icon: str # Emoji or Lucide icon name
    char_limit: int = Field(default=280)
    is_active: bool = Field(default=True)
    
    # Customization
    default_hashtags: Optional[str] = "" # e.g. "#tech #news"
    post_suffix: Optional[str] = "" # e.g. "Link in bio 👇"

