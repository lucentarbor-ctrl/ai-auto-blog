from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import datetime
import os
from typing import List, Optional

app = FastAPI(title="AI Auto Blog API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
app.mount("/admin", StaticFiles(directory="../frontend/admin", html=True), name="admin")

# 데이터 모델
class Post(BaseModel):
    id: Optional[int] = None
    title: str
    content: str
    category: str
    tags: List[str] = []
    source_type: str = "manual"  # ai_news, course, manual
    scheduled_time: Optional[datetime] = None
    published_time: Optional[datetime] = None
    status: str = "draft"  # draft, scheduled, published

class NewsItem(BaseModel):
    id: Optional[int] = None
    source: str
    title: str
    summary: str
    url: str
    crawled_date: datetime
    processed: bool = False

class Course(BaseModel):
    id: Optional[int] = None
    course_type: str  # notion, obsidian
    lesson_number: int
    title: str
    content: str
    github_url: str
    status: str = "pending"

# 임시 데이터 저장소 (실제로는 데이터베이스 사용)
posts = []
news_items = []
courses = []

# API 엔드포인트
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/api/stats")
def get_stats():
    """대시보드 통계 반환"""
    today = datetime.now().date()
    
    # 오늘 발행된 포스트 수
    today_posts = len([p for p in posts if p.get('published_time') and p['published_time'].date() == today])
    
    # 예약된 포스트 수
    scheduled_posts = len([p for p in posts if p.get('status') == 'scheduled'])
    
    # AI 뉴스 수
    ai_news_count = len(news_items)
    new_news_count = len([n for n in news_items if not n.get('processed', False)])
    
    # 강좌 진행률
    published_courses = len([c for c in courses if c.get('status') == 'published'])
    total_courses = 65  # 노션 30 + 옵시디언 35
    
    return {
        "today_posts": today_posts,
        "scheduled_posts": scheduled_posts,
        "ai_news_count": ai_news_count,
        "new_news_count": new_news_count,
        "course_progress": f"{published_courses}/{total_courses}",
        "course_percent": round((published_courses / total_courses) * 100, 1)
    }

@app.get("/api/posts")
def get_posts(status: Optional[str] = None, limit: int = 10):
    """포스트 목록 조회"""
    filtered_posts = posts
    if status:
        filtered_posts = [p for p in posts if p.get('status') == status]
    return filtered_posts[:limit]

@app.post("/api/posts")
def create_post(post: Post):
    """새 포스트 생성"""
    post_dict = post.dict()
    post_dict['id'] = len(posts) + 1
    post_dict['created_at'] = datetime.now()
    posts.append(post_dict)
    return {"message": "포스트가 생성되었습니다", "post": post_dict}

@app.get("/api/news")
def get_news(limit: int = 10):
    """AI 뉴스 목록 조회"""
    # 시뮬레이션 데이터
    if not news_items:
        news_items.extend([
            {
                "id": 1,
                "source": "OpenAI",
                "title": "GPT-4 Turbo 새로운 기능 발표",
                "summary": "더 빠른 응답 속도와 향상된 코딩 능력...",
                "url": "https://openai.com/blog",
                "crawled_date": datetime.now(),
                "processed": False
            },
            {
                "id": 2,
                "source": "Anthropic",
                "title": "Claude 3.5 Sonnet 업데이트",
                "summary": "컴퓨터 사용 능력과 향상된 추론...",
                "url": "https://anthropic.com/news",
                "crawled_date": datetime.now(),
                "processed": False
            }
        ])
    return news_items[:limit]

@app.post("/api/news/{news_id}/process")
def process_news(news_id: int):
    """뉴스 아이템 처리 (번역 및 발행)"""
    news_item = next((item for item in news_items if item.get('id') == news_id), None)
    if not news_item:
        raise HTTPException(status_code=404, detail="뉴스를 찾을 수 없습니다")
    
    # 처리 시뮬레이션
    news_item['processed'] = True
    
    # 포스트로 변환
    post = {
        "id": len(posts) + 1,
        "title": f"[AI 뉴스] {news_item['title']}",
        "content": news_item['summary'],
        "category": "AI 뉴스",
        "tags": ["AI", news_item['source']],
        "source_type": "ai_news",
        "status": "scheduled",
        "scheduled_time": datetime.now()
    }
    posts.append(post)
    
    return {"message": "뉴스가 처리되었습니다", "post": post}

@app.get("/api/courses")
def get_courses(course_type: Optional[str] = None):
    """강좌 목록 조회"""
    filtered_courses = courses
    if course_type:
        filtered_courses = [c for c in courses if c.get('course_type') == course_type]
    return filtered_courses

@app.post("/api/automation/run")
def run_automation(automation_type: str):
    """자동화 실행"""
    if automation_type == "daily":
        # 일일 자동화 로직
        return {"message": "일일 자동화가 시작되었습니다", "status": "running"}
    elif automation_type == "news_crawler":
        # 뉴스 크롤러 실행
        return {"message": "뉴스 크롤러가 실행되었습니다", "status": "running"}
    else:
        raise HTTPException(status_code=400, detail="알 수 없는 자동화 타입")

@app.get("/api/schedule")
def get_schedule():
    """오늘의 발행 일정"""
    today = datetime.now().date()
    scheduled_items = [
        {
            "time": "09:00",
            "title": "AI 뉴스 종합",
            "description": "오늘의 주요 AI 뉴스 10선",
            "type": "ai_news"
        },
        {
            "time": "12:30",
            "title": "노션 마스터 클래스 - 1강",
            "description": "노션 시작하기: 첫 페이지 만들기",
            "type": "course"
        },
        {
            "time": "19:00",
            "title": "Claude vs GPT-4 실전 비교",
            "description": "2025년 최신 AI 모델 성능 분석",
            "type": "analysis"
        }
    ]
    return scheduled_items

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)