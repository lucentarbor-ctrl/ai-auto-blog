#!/usr/bin/env python3
"""
AI 블로그 백엔드 - 간단한 FastAPI 버전
빠른 테스트를 위한 최소 구현
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import random
from datetime import datetime
import ollama

app = FastAPI(title="AI Auto Blog Simple API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 설정 - 로컬 다운로드된 모델로 변경
MODEL_NAME = "deepseek-coder-v2:16b"

# 응답 모델들
class StatsResponse(BaseModel):
    total_posts: int
    published_posts: int
    draft_posts: int
    total_views: int
    engagement_rate: float
    trending_topics: List[str]

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    status: str
    created_at: str

# 더미 데이터
dummy_posts = [
    {
        "id": 1,
        "title": "AI 기반 블로그 작성의 미래",
        "content": "인공지능이 블로그 작성에 미치는 영향과 전망에 대해 알아봅니다.",
        "status": "published",
        "created_at": "2025-01-18T10:00:00Z"
    },
    {
        "id": 2,
        "title": "로컬 AI 모델 활용 가이드",
        "content": "Ollama를 활용한 로컬 AI 모델 구축 방법을 소개합니다.",
        "status": "draft",
        "created_at": "2025-01-18T11:00:00Z"
    }
]

def call_ollama(prompt: str, system_prompt: str = "") -> str:
    """Ollama 모델 호출"""
    try:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = ollama.chat(
            model=MODEL_NAME,
            messages=messages
        )
        return response['message']['content']
    except Exception as e:
        print(f"Ollama 호출 오류: {e}")
        return f"[오류: {e}]"

# API 엔드포인트들

@app.get("/")
def root():
    return {"message": "AI Auto Blog API", "version": "1.0.0"}

@app.get("/api/stats")
def get_stats():
    """대시보드 통계 데이터"""
    return StatsResponse(
        total_posts=len(dummy_posts),
        published_posts=len([p for p in dummy_posts if p["status"] == "published"]),
        draft_posts=len([p for p in dummy_posts if p["status"] == "draft"]),
        total_views=247,
        engagement_rate=3.2,
        trending_topics=["AI", "머신러닝", "블로그", "콘텐츠 마케팅", "SEO"]
    )

@app.get("/api/posts")
def get_posts(status: Optional[str] = None):
    """포스트 목록"""
    posts = dummy_posts
    if status:
        posts = [p for p in posts if p["status"] == status]
    return posts

@app.post("/api/posts")
def create_post(post_data: dict):
    """새 포스트 생성"""
    new_post = {
        "id": len(dummy_posts) + 1,
        "title": post_data.get("title", "새 포스트"),
        "content": post_data.get("content", ""),
        "status": post_data.get("status", "draft"),
        "created_at": datetime.now().isoformat() + "Z"
    }
    dummy_posts.append(new_post)
    return new_post

@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int):
    """포스트 삭제"""
    global dummy_posts
    dummy_posts = [p for p in dummy_posts if p["id"] != post_id]
    return {"message": "삭제 완료"}

@app.get("/api/posts/{post_id}")
def get_post(post_id: int):
    """개별 포스트"""
    post = next((p for p in dummy_posts if p["id"] == post_id), None)
    if not post:
        return {"error": "포스트를 찾을 수 없습니다"}
    return post

# AI 관련 엔드포인트들

@app.post("/api/ai/generate-titles")
def generate_titles(request: dict):
    """AI 제목 생성"""
    topic = request.get("topic", "")
    keywords = request.get("keywords", [])
    
    prompt = f"주제 '{topic}'에 대한 SEO 최적화된 블로그 제목 5개를 생성해주세요."
    
    # 더미 응답 (실제로는 Ollama 호출)
    titles = [
        {"title": f"{topic}의 모든 것: 완벽 가이드", "seo_score": 95},
        {"title": f"2025년 {topic} 트렌드 분석", "seo_score": 90},
        {"title": f"{topic} 초보자를 위한 실용 팁", "seo_score": 88},
        {"title": f"전문가가 알려주는 {topic} 활용법", "seo_score": 85},
        {"title": f"{topic}로 성공하는 5가지 방법", "seo_score": 82}
    ]
    
    return {"status": "success", "titles": titles}

@app.post("/api/ai/change-tone")
def change_tone(request: dict):
    """텍스트 톤 변경"""
    text = request.get("text", "")
    tone = request.get("tone", "friendly")
    
    # Ollama 호출
    prompt = f"다음 텍스트를 {tone} 톤으로 다시 써주세요:\n\n{text}"
    result = call_ollama(prompt, "당신은 전문 콘텐츠 작가입니다.")
    
    return {"status": "success", "changed_text": result}

@app.post("/api/ai/analyze-seo")
def analyze_seo(request: dict):
    """SEO 분석"""
    title = request.get("title", "")
    content = request.get("content", "")
    
    # 간단한 분석
    analysis = {
        "overall_score": random.randint(70, 95),
        "title_analysis": {
            "length": len(title),
            "optimal": 50 <= len(title) <= 60,
            "suggestion": "제목 길이가 적절합니다" if 50 <= len(title) <= 60 else "제목을 50-60자로 조정하세요"
        },
        "content_analysis": {
            "word_count": len(content.split()),
            "readability": "좋음",
            "keyword_density": "적절"
        },
        "improvements": [
            "메타 설명 추가 필요",
            "이미지 alt 텍스트 추가",
            "내부 링크 추가 권장"
        ]
    }
    
    return {"status": "success", "analysis": analysis}

@app.post("/api/templates/generate")
def generate_template(request: dict):
    """템플릿 기반 텍스트 생성"""
    template_type = request.get("template", "blog_intro")
    content = request.get("content", "")
    
    # Ollama 호출
    prompts = {
        "blog_intro": f"다음 주제로 블로그 도입부를 작성해주세요: {content}",
        "product_description": f"다음 제품에 대한 설명을 작성해주세요: {content}",
        "social_media": f"다음 내용으로 소셜미디어 포스트를 작성해주세요: {content}"
    }
    
    prompt = prompts.get(template_type, f"다음 내용으로 글을 작성해주세요: {content}")
    result = call_ollama(prompt, "당신은 전문 콘텐츠 작가입니다.")
    
    return {"status": "success", "generated_text": result}

@app.get("/api/analytics/performance")
def get_performance():
    """성능 분석 데이터"""
    return {
        "page_views": random.randint(1000, 5000),
        "bounce_rate": round(random.uniform(30, 60), 1),
        "avg_session_duration": random.randint(120, 300),
        "conversion_rate": round(random.uniform(1, 5), 1)
    }

@app.get("/api/analytics/engagement")
def get_engagement():
    """참여도 분석"""
    return {
        "likes": random.randint(50, 500),
        "shares": random.randint(10, 100),
        "comments": random.randint(5, 50),
        "engagement_rate": round(random.uniform(2, 8), 1)
    }

# 기타 필요한 엔드포인트들
@app.get("/api/news")
def get_news():
    """뉴스 데이터"""
    return []

@app.get("/api/ideas")
def get_ideas():
    """아이디어 목록"""
    return []

@app.get("/api/reminders")
def get_reminders():
    """리마인더 목록"""
    return []

@app.get("/api/platforms")
def get_platforms():
    """플랫폼 연결 상태"""
    return []

if __name__ == "__main__":
    import uvicorn
    print("🚀 AI Auto Blog Simple API 시작...")
    print("🌐 http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)