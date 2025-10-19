from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Post Schemas ---
class PostVersionBase(BaseModel):
    title: str
    content: str

class PostVersionCreate(PostVersionBase):
    pass

class PostVersion(PostVersionBase):
    id: int
    post_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class SeriesBase(BaseModel):
    title: str
    description: Optional[str] = None

class SeriesCreate(SeriesBase):
    pass

class PostBase(BaseModel):
    title: str
    content: str
    category: str
    tags: List[str] = []
    status: str = "draft"
    series_id: Optional[int] = None

class PostCreate(PostBase):
    pass

class Series(SeriesBase):
    id: int
    posts: List['Post'] = []

    class Config:
        orm_mode = True

class Post(PostBase):
    id: int
    views: int = 0
    shares: int = 0
    likes: int = 0
    comments: int = 0
    created_at: datetime
    published_time: Optional[datetime] = None
    series: Optional[SeriesBase] = None
    versions: List[PostVersion] = []

    class Config:
        orm_mode = True

Series.update_forward_refs(Post=Post)

# --- Idea Schemas ---
class IdeaBase(BaseModel):
    content: str

class IdeaCreate(IdeaBase):
    pass

class Idea(IdeaBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# --- Analytics Schemas ---
class AnalyticsBase(BaseModel):
    page_views: int = 0
    unique_visitors: int = 0
    avg_session_duration: float = 0.0
    bounce_rate: float = 0.0

class AnalyticsCreate(AnalyticsBase):
    pass

class Analytics(AnalyticsBase):
    id: int
    date: datetime

    class Config:
        orm_mode = True

# --- Dashboard Stats Schema ---
class DashboardStats(BaseModel):
    total_views: int
    published_posts: int
    draft_posts: int
    engagement_rate: float

# --- User Activity Schemas ---
class UserActivityCreate(BaseModel):
    session_id: str
    page_url: str
    time_spent: float
    user_agent: Optional[str] = None
    referrer: Optional[str] = None

class UserActivity(UserActivityCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# --- Trend Keyword Schemas ---
class TrendKeywordBase(BaseModel):
    keyword: str
    popularity_score: float
    category: str
    is_active: bool = True

class TrendKeywordCreate(TrendKeywordBase):
    pass

class TrendKeyword(TrendKeywordBase):
    id: int
    date_added: datetime

    class Config:
        orm_mode = True

# --- Insight Schemas ---
class InsightBase(BaseModel):
    title: str
    content: str
    insight_type: str
    priority: str = "medium"
    is_read: bool = False

class InsightCreate(InsightBase):
    pass

class Insight(InsightBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# --- Request Schemas ---
class ResearchRequest(BaseModel):
    query: str

class TemplateRequest(BaseModel):
    template: str
    topic: str

# --- A/B Test Schemas ---
class TitleABTestRequest(BaseModel):
    title_a: str
    title_b: str

class TitleComparison(BaseModel):
    title: str
    score: float
    explanation: str

class TitleABTestResponse(BaseModel):
    winner: str
    reason: str
    title_a: TitleComparison
    title_b: TitleComparison

# --- Thumbnail Schemas ---
class ThumbnailRequest(BaseModel):
    text: str
    style: str
