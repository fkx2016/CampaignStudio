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

class WorkspaceSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    default_overlay_text: str = Field(default="AppleSux")
    default_qr_url: str = Field(default="https://fkxx.substack.com")
    default_music_url: str = Field(default="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1")



class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Mode(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str  # "Political", "Donation", etc.
    slug: str = Field(index=True, unique=True) # "political", "donation"
    description: str  # User-facing explanation
    
    # AI Guidance
    tone_guidelines: str = Field(default="") # "Provocative but not offensive. Question assumptions."
    structure_template: str = Field(default="") # "Hook → Evidence → Question → CTA"
    example_prompts: str = Field(default="[]") # JSON array of example good posts
    
    # Constraints
    preferred_platforms: str = Field(default="[]") # JSON array of platform slugs
    optimal_length_range: str = Field(default="") # "100-280 chars" or "500-1000 words"
    
    # Metadata
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
