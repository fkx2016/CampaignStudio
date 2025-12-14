from enum import Enum

class PostStatus(str, Enum):
    PENDING = "Pending"
    POSTED = "Posted"

class CampaignStatus(str, Enum):
    ACTIVE = "Active"
    ARCHIVED = "Archived"
    COMPLETED = "Completed"

class ModeSlug(str, Enum):
    EBEG = "ebeg"
    CONTENT = "content"
    PROMOTION = "promotion"
    POLITICAL = "political"
    EDUCATION = "education"
    AWARENESS = "awareness"
