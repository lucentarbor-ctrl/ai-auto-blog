from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Series(Base):
    __tablename__ = "series"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    posts = relationship("Post", back_populates="series")

class PostVersion(Base):
    __tablename__ = "post_versions"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    title = Column(String)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    post = relationship("Post", back_populates="versions")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    series_id = Column(Integer, ForeignKey("series.id"), nullable=True)
    title = Column(String, index=True)
    content = Column(Text)
    category = Column(String)
    tags = Column(JSON)
    status = Column(String, default="draft")
    views = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    published_time = Column(DateTime(timezone=True), nullable=True)
    series = relationship("Series", back_populates="posts")
    versions = relationship("PostVersion", back_populates="post", cascade="all, delete-orphan")

class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    page_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    avg_session_duration = Column(Float, default=0.0)  # in seconds
    bounce_rate = Column(Float, default=0.0)  # percentage
    
class UserActivity(Base):
    __tablename__ = "user_activity"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    page_url = Column(String)
    time_spent = Column(Float)  # in seconds
    user_agent = Column(String)
    referrer = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TrendKeyword(Base):
    __tablename__ = "trend_keywords"
    
    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, index=True)
    popularity_score = Column(Float)
    category = Column(String)
    date_added = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

class Insight(Base):
    __tablename__ = "insights"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    insight_type = Column(String)  # performance, audience, keyword, improvement
    priority = Column(String, default="medium")  # low, medium, high
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
