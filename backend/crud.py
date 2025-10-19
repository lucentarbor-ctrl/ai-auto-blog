from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import models, schemas

# --- Post CRUD ---
def get_post(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.id == post_id).first()

def get_posts(db: Session, skip: int = 0, limit: int = 100, status: str = None):
    query = db.query(models.Post)
    if status:
        query = query.filter(models.Post.status == status)
    return query.offset(skip).limit(limit).all()

def create_post_version(db: Session, post: models.Post):
    version = models.PostVersion(post_id=post.id, title=post.title, content=post.content)
    db.add(version)
    db.commit()
    db.refresh(version)
    return version

def create_post(db: Session, post: schemas.PostCreate):
    db_post = models.Post(**post.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    create_post_version(db, db_post)
    return db_post

def update_post(db: Session, post_id: int, post: schemas.PostCreate):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post:
        for key, value in post.dict().items():
            setattr(db_post, key, value)
        db.commit()
        db.refresh(db_post)
        create_post_version(db, db_post)
    return db_post

def delete_post(db: Session, post_id: int):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post:
        db.delete(db_post)
        db.commit()
    return db_post

def get_post_versions(db: Session, post_id: int):
    return db.query(models.PostVersion).filter(models.PostVersion.post_id == post_id).all()

def get_post_version(db: Session, version_id: int):
    return db.query(models.PostVersion).filter(models.PostVersion.id == version_id).first()


def increment_post_views(db: Session, post_id: int):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post:
        db_post.views += 1
        db.commit()
        db.refresh(db_post)
    return db_post

# --- Series CRUD ---
def get_series(db: Session, series_id: int):
    return db.query(models.Series).filter(models.Series.id == series_id).first()

def get_all_series(db: Session):
    return db.query(models.Series).all()

def create_series(db: Session, series: schemas.SeriesCreate):
    db_series = models.Series(**series.dict())
    db.add(db_series)
    db.commit()
    db.refresh(db_series)
    return db_series


# --- Idea CRUD ---
def get_ideas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Idea).offset(skip).limit(limit).all()

def create_idea(db: Session, idea: schemas.IdeaCreate):
    db_idea = models.Idea(**idea.dict())
    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)
    return db_idea

# --- Analytics CRUD ---
def create_analytics(db: Session, analytics: schemas.AnalyticsCreate):
    db_analytics = models.Analytics(**analytics.dict())
    db.add(db_analytics)
    db.commit()
    db.refresh(db_analytics)
    return db_analytics

def get_analytics_by_date_range(db: Session, start_date: datetime, end_date: datetime):
    return db.query(models.Analytics).filter(
        models.Analytics.date >= start_date,
        models.Analytics.date <= end_date
    ).all()

def get_dashboard_stats(db: Session):
    # 총 조회수
    total_views = db.query(func.sum(models.Post.views)).scalar() or 0
    
    # 발행된 글 수
    published_posts = db.query(models.Post).filter(models.Post.status == "published").count()
    
    # 임시저장 글 수
    draft_posts = db.query(models.Post).filter(models.Post.status == "draft").count()
    
    # 참여율 계산 (조회수 대비 좋아요+공유+댓글)
    total_engagement = db.query(
        func.sum(models.Post.likes + models.Post.shares + models.Post.comments)
    ).scalar() or 0
    
    engagement_rate = (total_engagement / total_views * 100) if total_views > 0 else 0
    
    return schemas.DashboardStats(
        total_views=total_views,
        published_posts=published_posts,
        draft_posts=draft_posts,
        engagement_rate=round(engagement_rate, 1)
    )

# --- User Activity CRUD ---
def create_user_activity(db: Session, activity: schemas.UserActivityCreate):
    db_activity = models.UserActivity(**activity.dict())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def get_user_activity_stats(db: Session, days: int = 7):
    start_date = datetime.now() - timedelta(days=days)
    
    # 페이지뷰
    page_views = db.query(models.UserActivity).filter(
        models.UserActivity.created_at >= start_date
    ).count()
    
    # 유니크 방문자
    unique_visitors = db.query(func.count(func.distinct(models.UserActivity.session_id))).filter(
        models.UserActivity.created_at >= start_date
    ).scalar() or 0
    
    # 평균 세션 시간
    avg_time = db.query(func.avg(models.UserActivity.time_spent)).filter(
        models.UserActivity.created_at >= start_date
    ).scalar() or 0
    
    # 바운스율 (한 페이지만 본 세션 비율)
    total_sessions = db.query(func.count(func.distinct(models.UserActivity.session_id))).filter(
        models.UserActivity.created_at >= start_date
    ).scalar() or 0
    
    single_page_sessions = db.query(func.count(func.distinct(models.UserActivity.session_id))).filter(
        models.UserActivity.created_at >= start_date,
        models.UserActivity.session_id.in_(
            db.query(models.UserActivity.session_id).filter(
                models.UserActivity.created_at >= start_date
            ).group_by(models.UserActivity.session_id).having(func.count() == 1).subquery()
        )
    ).scalar() or 0
    
    bounce_rate = (single_page_sessions / total_sessions * 100) if total_sessions > 0 else 0
    
    return {
        "page_views": page_views,
        "unique_visitors": unique_visitors,
        "avg_session_duration": round(avg_time, 2),
        "bounce_rate": round(bounce_rate, 1)
    }

# --- Trend Keywords CRUD ---
def create_trend_keyword(db: Session, keyword: schemas.TrendKeywordCreate):
    db_keyword = models.TrendKeyword(**keyword.dict())
    db.add(db_keyword)
    db.commit()
    db.refresh(db_keyword)
    return db_keyword

def get_trending_keywords(db: Session, limit: int = 10):
    return db.query(models.TrendKeyword).filter(
        models.TrendKeyword.is_active == True
    ).order_by(desc(models.TrendKeyword.popularity_score)).limit(limit).all()

# --- Insights CRUD ---
def create_insight(db: Session, insight: schemas.InsightCreate):
    db_insight = models.Insight(**insight.dict())
    db.add(db_insight)
    db.commit()
    db.refresh(db_insight)
    return db_insight

def get_insights(db: Session, limit: int = 10, unread_only: bool = False):
    query = db.query(models.Insight)
    if unread_only:
        query = query.filter(models.Insight.is_read == False)
    return query.order_by(desc(models.Insight.created_at)).limit(limit).all()

def mark_insight_as_read(db: Session, insight_id: int):
    db_insight = db.query(models.Insight).filter(models.Insight.id == insight_id).first()
    if db_insight:
        db_insight.is_read = True
        db.commit()
        db.refresh(db_insight)
    return db_insight
