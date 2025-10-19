from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import os
import random
import re
import urllib.parse
import requests
from bs4 import BeautifulSoup
from googlesearch import search
import google.generativeai as genai

import crud, models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Auto Blog API with DB", version="2.5.0")

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용 (개발용)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Key Configuration ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# --- DB Session Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- In-memory Stores ---
news_items = []
settings = {"crawling": {"keywords": ["AI"], "sources": ["google"]}}

# --- Endpoints ---

@app.get("/api/posts", response_model=List[schemas.Post])
def read_posts(status: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.get_posts(db, status=status)

@app.post("/api/posts", response_model=schemas.Post)
def create_new_post(post: schemas.PostCreate, db: Session = Depends(get_db)):
    return crud.create_post(db=db, post=post)

@app.get("/api/posts/{post_id}", response_model=schemas.Post)
def read_post(post_id: int, db: Session = Depends(get_db)):
    db_post = crud.get_post(db, post_id=post_id)
    if db_post is None: raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@app.put("/api/posts/{post_id}", response_model=schemas.Post)
def update_existing_post(post_id: int, post: schemas.PostCreate, db: Session = Depends(get_db)):
    return crud.update_post(db, post_id=post_id, post=post)

@app.delete("/api/posts/{post_id}", response_model=schemas.Post)
def delete_existing_post(post_id: int, db: Session = Depends(get_db)):
    return crud.delete_post(db, post_id=post_id)

@app.get("/api/posts/{post_id}/versions", response_model=List[schemas.PostVersion])
def read_post_versions(post_id: int, db: Session = Depends(get_db)):
    return crud.get_post_versions(db, post_id=post_id)

@app.get("/api/versions/{version_id}", response_model=schemas.PostVersion)
def read_single_post_version(version_id: int, db: Session = Depends(get_db)):
    db_version = crud.get_post_version(db, version_id=version_id)
    if db_version is None:
        raise HTTPException(status_code=404, detail="Version not found")
    return db_version


# --- Series Endpoints ---
@app.get("/api/series", response_model=List[schemas.Series])
def read_all_series(db: Session = Depends(get_db)):
    return crud.get_all_series(db)

@app.post("/api/series", response_model=schemas.Series)
def create_new_series(series: schemas.SeriesCreate, db: Session = Depends(get_db)):
    return crud.create_series(db=db, series=series)

@app.get("/api/series/{series_id}", response_model=schemas.Series)
def read_single_series(series_id: int, db: Session = Depends(get_db)):
    db_series = crud.get_series(db, series_id=series_id)
    if db_series is None:
        raise HTTPException(status_code=404, detail="Series not found")
    return db_series


@app.get("/api/ideas", response_model=List[schemas.Idea])
def read_ideas(db: Session = Depends(get_db)):
    return crud.get_ideas(db)

@app.post("/api/ideas", response_model=schemas.Idea)
def create_new_idea(idea: schemas.IdeaCreate, db: Session = Depends(get_db)):
    return crud.create_idea(db=db, idea=idea)

@app.post("/api/crawling/run")
def run_crawling_api():
    # ... (crawling logic remains the same)
    return {"message": "Crawling finished."}

@app.get("/api/news")
def get_news():
    return news_items

@app.post("/api/ai/research")
def smart_research_api(request: schemas.ResearchRequest):
    """Performs web search, scrapes content, and summarizes it using Google Gemini."""
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key is not configured.")
    try:
        urls = list(search(request.query, num_results=1, lang="ko"))
        if not urls:
            raise HTTPException(status_code=404, detail="No relevant web page found.")
        
        url = urls[0]
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        paragraphs = soup.find_all("p")
        full_text = " ".join([p.get_text() for p in paragraphs])

        if not full_text.strip():
            raise HTTPException(status_code=404, detail="Could not extract text from the page.")

        model = genai.GenerativeModel("gemini-pro")
        prompt = f"Please summarize the following text in Korean, focusing on the key points:\n\n{full_text[:4000]}"
        ai_response = model.generate_content(prompt)
        
        return {
            "summary": f"<h3>'{request.query}'에 대한 AI 요약</h3><p>{ai_response.text}</p>",
            "sources": [{"title": f"Source: {url}", "url": url, "snippet": full_text[:150] + "..."}]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during research: {str(e)}")

# --- Dashboard API Endpoints ---
@app.get("/api/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """실제 데이터베이스에서 대시보드 통계를 가져옵니다."""
    return crud.get_dashboard_stats(db)

@app.get("/api/analytics/period/{days}")
def get_analytics_by_period(days: int, db: Session = Depends(get_db)):
    """기간별 분석 데이터를 가져옵니다."""
    stats = crud.get_user_activity_stats(db, days=days)
    return stats

@app.get("/api/insights", response_model=List[schemas.Insight])
def get_insights_api(unread_only: bool = False, db: Session = Depends(get_db)):
    """AI 인사이트를 가져옵니다."""
    return crud.get_insights(db, unread_only=unread_only)

@app.post("/api/insights", response_model=schemas.Insight)
def create_insight_api(insight: schemas.InsightCreate, db: Session = Depends(get_db)):
    """새로운 인사이트를 생성합니다."""
    return crud.create_insight(db, insight)

@app.get("/api/trending-keywords", response_model=List[schemas.TrendKeyword])
def get_trending_keywords_api(limit: int = 10, db: Session = Depends(get_db)):
    """트렌딩 키워드를 가져옵니다."""
    return crud.get_trending_keywords(db, limit=limit)

@app.post("/api/trending-keywords", response_model=schemas.TrendKeyword)
def create_trending_keyword_api(keyword: schemas.TrendKeywordCreate, db: Session = Depends(get_db)):
    """새로운 트렌딩 키워드를 추가합니다."""
    return crud.create_trend_keyword(db, keyword)

@app.post("/api/user-activity", response_model=schemas.UserActivity)
def track_user_activity_api(activity: schemas.UserActivityCreate, db: Session = Depends(get_db)):
    """사용자 활동을 기록합니다."""
    return crud.create_user_activity(db, activity)

@app.post("/api/posts/{post_id}/view")
def increment_post_view(post_id: int, db: Session = Depends(get_db)):
    """포스트 조회수를 증가시킵니다."""
    post = crud.increment_post_views(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "View count updated", "views": post.views}

# --- Content Generation Endpoints ---
@app.post("/api/templates/generate")
def generate_from_template(request: schemas.TemplateRequest):
    return {"generated_text": f"<h3>{request.topic}에 대한 생성된 템플릿 (더미)</h3>"}

# --- AI Content Generation ---
@app.post("/api/ai/generate")
def generate_content_api(request: dict):
    """AI 템플릿 기반 콘텐츠 생성 (Gemini API)"""
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key is not configured.")

    template_type = request.get("template", "blog-intro")
    title = request.get("title", "Untitled")
    
    prompts = {
        "blog-intro": f"'{title}'에 대한 블로그 포스트 서론을 작성해주세요. 흥미를 유발하고, 무엇에 대해 다룰지 알려주는 내용을 포함해야 합니다. 결과는 HTML 형식으로 h2, h3, p, ul, li 태그를 사용하여 보기 좋게 만들어주세요.",
        "product-review": f"'{title}' 제품에 대한 리뷰 기사를 작성해주세요. 제품 개요, 장점, 단점, 총평을 포함해야 합니다. 결과는 HTML 형식으로 h2, h3, p, ul, li 태그를 사용하여 보기 좋게 만들어주세요.",
        "how-to": f"'{title}'에 대한 단계별 가이드(How-to)를 작성해주세요. 각 단계를 명확히 구분하고, 독자가 따라하기 쉽게 설명해야 합니다. 결과는 HTML 형식으로 h2, h3, h4, p, ul, li 태그를 사용하여 보기 좋게 만들어주세요."
    }
    
    prompt = prompts.get(template_type, prompts["blog-intro"])

    try:
        model = genai.GenerativeModel("gemini-pro")
        ai_response = model.generate_content(prompt)
        
        # 마크다운을 HTML로 변환 (기본적인 변환)
        html_content = ai_response.text.replace("\n", "<br>")
        
        return {"content": html_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI content generation failed: {str(e)}")

@app.post("/api/ai/generate-titles")
def generate_titles_api(request: dict):
    """AI 제목 생성 (Gemini API)"""
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key is not configured.")

    topic = request.get("topic", "")
    if not topic.strip():
        return {"titles": []}

    prompt = f"블로그 주제 '{topic}'에 대한 흥미로운 제목 5개를 제안해주세요. 각 제목은 60자 미만이어야 합니다. 결과는 'titles' 키를 가진 JSON 리스트 형식으로 반환해주세요. 예: [{"title": "제목1"}, {"title": "제목2"}]"

    try:
        model = genai.GenerativeModel("gemini-pro")
        ai_response = model.generate_content(prompt)
        import json
        cleaned_response = ai_response.text.strip().replace("```json", "").replace("```", "").strip()
        titles = json.loads(cleaned_response)
        return titles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI title generation failed: {str(e)}")

@app.post("/api/ai/tone")
def change_tone_api(request: dict):
    """텍스트 톤 변경 (Gemini API)"""
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key is not configured.")

    text = request.get("text", "")
    tone = request.get("tone", "professional")
    
    if not text.strip():
        return {"text": ""}

    prompt = f"다음 텍스트를 '{tone}' 톤으로 다시 작성해주세요. 원본의 의미는 유지하면서, 문체만 변경해야 합니다.\n\n원본 텍스트: \"{text}\""

    try:
        model = genai.GenerativeModel("gemini-pro")
        ai_response = model.generate_content(prompt)
        return {"text": ai_response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI tone change failed: {str(e)}")

@app.post("/api/ai/fact-check")
def fact_check_api(request: dict):
    """팩트체크 (Gemini API)"""
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key is not configured.")

    content = request.get("content", "")
    if not content.strip():
        return {"results": []}

    prompt = f"""다음 텍스트의 주요 주장들을 식별하고, 각 주장에 대한 팩트체크를 수행해주세요. 각 주장에 대해 '검증됨', '검증 필요', '오류' 중 하나의 상태와 함께 간단한 설명을 제공해주세요. 결과를 JSON 형식의 리스트로 반환해주세요. 각 항목은 'claim', 'status', 'explanation' 키를 가져야 합니다.\n\n텍스트: """{content}""""""

    try:
        model = genai.GenerativeModel("gemini-pro")
        ai_response = model.generate_content(prompt)
        
        # Gemini가 반환한 텍스트에서 JSON만 추출
        import json
        # The response might be in a markdown code block, so we need to clean it.
        cleaned_response = ai_response.text.strip().replace("```json", "").replace("```", "").strip()
        
        results = json.loads(cleaned_response)
        return {"results": results}
    except Exception as e:
        # Fallback to a simpler text-based analysis if JSON parsing fails
        try:
            return {"results": [{"claim": "분석 결과", "status": "info", "explanation": ai_response.text}]}
        except:
             raise HTTPException(status_code=500, detail=f"AI fact-check failed: {str(e)}")

@app.post("/api/seo/analyze")
def analyze_seo_api(request: dict):
    """SEO 분석 (Gemini API)"""
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key is not configured.")

    content = request.get("content", "")
    if not content.strip():
        return {"score": 0, "suggestions": ["분석할 콘텐츠가 없습니다."]}

    prompt = f"""다음 블로그 콘텐츠에 대한 SEO 분석을 수행하고, 100점 만점의 점수와 구체적인 개선 제안 목록을 제공해주세요. 점수는 'score' 키에, 제안 목록은 'suggestions' 키에 담아 JSON 형식으로 반환해주세요.\n\n콘텐츠: """{content}""""""

    try:
        model = genai.GenerativeModel("gemini-pro")
        ai_response = model.generate_content(prompt)
        
        import json
        cleaned_response = ai_response.text.strip().replace("```json", "").replace("```", "").strip()
        
        analysis = json.loads(cleaned_response)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI SEO analysis failed: {str(e)}")

@app.post("/api/hashtags/generate")
def generate_hashtags_api(request: dict):
    """해시태그 생성 (Gemini API)"""
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key is not configured.")

    content = request.get("content", "")
    if not content.strip():
        return {"hashtags": []}

    prompt = f"다음 콘텐츠에 가장 적합한 해시태그 목록을 생성해주세요. 결과는 JSON 형식의 리스트로, 각 해시태그는 '#'으로 시작해야 합니다.\n\n콘텐츠: """{content}""""

    try:
        model = genai.GenerativeModel("gemini-pro")
        ai_response = model.generate_content(prompt)
        
        import json
        cleaned_response = ai_response.text.strip().replace("```json", "").replace("```", "").strip()
        
        hashtags = json.loads(cleaned_response)
        return {"hashtags": hashtags}
    except Exception as e:
        # Fallback for non-json response
        try:
            # Attempt to parse hashtags from a plain text response
            hashtags = [tag.strip() for tag in ai_response.text.split() if tag.startswith('#')]
            if hashtags:
                return {"hashtags": hashtags}
        except:
            pass # Ignore if fallback fails
        raise HTTPException(status_code=500, detail=f"AI hashtag generation failed: {str(e)}")

@app.post("/api/readability/analyze")
def analyze_readability_api(request: dict):
    """가독성 분석 (Gemini API)"""
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key is not configured.")

    content = request.get("content", "")
    if not content.strip():
        return {"score": 0, "level": "N/A", "suggestions": ["분석할 콘텐츠가 없습니다."]}

    prompt = f"""다음 텍스트의 가독성을 분석해주세요. 100점 만점의 'score', 가독성 수준을 나타내는 'level' (예: 초급, 중급, 고급), 그리고 개선 제안 목록인 'suggestions'를 포함한 JSON 형식으로 결과를 반환해주세요.\n\n텍스트: """{content}""""""

    try:
        model = genai.GenerativeModel("gemini-pro")
        ai_response = model.generate_content(prompt)
        
        import json
        cleaned_response = ai_response.text.strip().replace("```json", "").replace("```", "").strip()
        
        analysis = json.loads(cleaned_response)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI readability analysis failed: {str(e)}")

@app.post("/api/youtube/analyze")
def analyze_youtube_api(request: dict):
    """유튜브 영상 분석 (Scraping + Gemini API)"""
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key is not configured.")

    url = request.get("url", "")
    if not url:
        raise HTTPException(status_code=400, detail="URL이 필요합니다")

    try:
        headers = {"User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en;q=0.5"}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        # 메타 태그에서 제목과 설명 추출 (더 안정적)
        title = soup.find("meta", property="og:title")["content"]
        description = soup.find("meta", property="og:description")["content"]
        video_id_match = re.search(r'(?:youtube\.com\/watch\?v=|youtu\.be\/|m\.youtube\.com\/watch\?v=)([\w-]+)', url)
        video_id = video_id_match.group(1) if video_id_match else None

        if not title or not description:
            raise HTTPException(status_code=404, detail="Could not extract video metadata.")

        # Gemini API로 요약 및 분석 요청
        model = genai.GenerativeModel("gemini-pro")
        prompt = f"""유튜브 영상 정보를 바탕으로 다음 항목들을 생성해주세요:\n1. 영상 내용에 대한 상세한 한국어 요약 (summary)\n2. 영상의 핵심 키워드 목록 (keywords)\n3. 이 영상을 활용한 블로그 포스트 아이디어 (blog_suggestions)\n4. 영상의 흐름을 예측한 가상 타임스탬프 목록 (timestamps)\n\n영상 제목: {title}\n영상 설명: {description}\n\n결과는 'summary', 'keywords', 'blog_suggestions', 'timestamps' 키를 포함하는 JSON 형식으로 반환해주세요."""
        
        ai_response = model.generate_content(prompt)
        import json
        cleaned_response = ai_response.text.strip().replace("```json", "").replace("```", "").strip()
        analysis = json.loads(cleaned_response)

        analysis_result = {
            "video_id": video_id,
            "url": url,
            "title": title,
            "channel": soup.find("link", itemprop="name")["content"],
            "duration": soup.find("meta", itemprop="duration")["content"].replace("PT", "").replace("M", ":").replace("S", ""),
            "views": soup.find("meta", itemprop="interactionCount")["content"],
            "description": description,
            "summary": analysis.get("summary", ""),
            "timestamps": analysis.get("timestamps", []),
            "keywords": analysis.get("keywords", []),
            "blog_suggestions": analysis.get("blog_suggestions", "")
        }
        
        return {
            "status": "success",
            "analysis": analysis_result,
            "message": f"URL {url} 분석 완료"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 중 오류 발생: {str(e)}")

@app.post("/api/ai/ab-test-titles", response_model=schemas.TitleABTestResponse)
def ab_test_titles_api(request: schemas.TitleABTestRequest):
    """두 개의 제목을 A/B 테스트하고 AI가 승자를 결정합니다."""
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key is not configured.")

    prompt = f"""
    두 개의 블로그 제목, "제목 A"와 "제목 B"가 있습니다.

    - 제목 A: "{request.title_a}"
    - 제목 B: "{request.title_b}"

    다음 기준에 따라 각 제목을 분석하고, 어떤 제목이 더 나은지 결정해주세요:
    1.  **참여도 (Engagement)**: 어떤 제목이 더 많은 클릭, 공유, 댓글을 유도할 것 같은가?
    2.  **명확성 (Clarity)**: 어떤 제목이 콘텐츠 내용을 더 명확하게 전달하는가?
    3.  **감성적 영향 (Emotional Impact)**: 어떤 제목이 독자의 호기심, 흥미, 또는 감정을 더 자극하는가?

    분석 결과를 다음 JSON 형식으로 반환해주세요:
    {{
      "winner": "A" 또는 "B",
      "reason": "승자를 선택한 종합적인 이유 (2-3 문장)",
      "title_a": {{
        "title": "{request.title_a}",
        "score": "100점 만점의 점수 (예: 85.5)",
        "explanation": "제목 A에 대한 구체적인 분석 및 평가"
      }},
      "title_b": {{
        "title": "{request.title_b}",
        "score": "100점 만점의 점수 (예: 92.0)",
        "explanation": "제목 B에 대한 구체적인 분석 및 평가"
      }}
    }}
    """

    try:
        model = genai.GenerativeModel("gemini-pro")
        ai_response = model.generate_content(prompt)
        
        import json
        cleaned_response = ai_response.text.strip().replace("```json", "").replace("```", "").strip()
        
        result = json.loads(cleaned_response)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI A/B test failed: {str(e)}")


@app.post("/api/ai/generate-thumbnail", response_model=dict)
def generate_thumbnail_api(request: schemas.ThumbnailRequest):
    """썸네일 생성 (개선된 플레이스홀더)"""
    text = urllib.parse.quote(request.text)
    style = request.style

    # 스타일에 따라 색상 동적 변경
    color_map = {
        "modern": "007BFF/FFFFFF",      # 파란색 배경, 흰색 텍스트
        "minimal": "F8F9FA/212529",      # 밝은 회색 배경, 검은색 텍스트
        "colorful": "FFC107/000000",     # 노란색 배경, 검은색 텍스트
        "professional": "343A40/FFFFFF",  # 어두운 회색 배경, 흰색 텍스트
    }
    colors = color_map.get(style, "7F5BFF/FFFFFF") # 기본값

    placeholder_url = f"https://placehold.co/600x400/{colors}?text={text}&font=noto-sans-kr"
    return {"imageUrl": placeholder_url}

@app.post("/api/seo/meta-tags")
def generate_meta_tags_api(request: dict):
    """메타 태그 생성 (플레이스홀더)"""
    title = request.get("title", "")
    content = request.get("content", "")
    
    if not GOOGLE_API_KEY:
        # Return simple defaults if API key is not available
        return {
            "title": title,
            "description": content[:150]
        }

    prompt = f"다음 블로그 제목과 내용을 바탕으로 SEO에 최적화된 title (50자 이내)과 meta description (150자 이내)을 생성해주세요. 결과는 'title'과 'description' 키를 가진 JSON 형식으로 반환해주세요.\n\n제목: {title}\n내용: {content[:500]}"
    
    try:
        model = genai.GenerativeModel("gemini-pro")
        ai_response = model.generate_content(prompt)
        import json
        cleaned_response = ai_response.text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_response)
    except Exception as e:
        # Fallback to simple defaults on error
        return {
            "title": title,
            "description": content[:150]
        }

# --- Data Seeding Endpoint (개발용) ---
@app.post("/api/seed-data")
def seed_sample_data(db: Session = Depends(get_db)):
    """개발용 샘플 데이터를 생성합니다."""
    import random
    from datetime import datetime, timedelta
    
    # 기존 데이터 모두 삭제
    db.query(models.Post).delete()
    db.query(models.Insight).delete()
    db.query(models.TrendKeyword).delete()
    db.query(models.UserActivity).delete()
    db.commit()
    
    # 샘플 포스트 생성
    sample_posts = [
        {"title": "AI 기술의 최신 동향", "content": "AI 기술이 급속도로 발전하고 있습니다...", "category": "AI 뉴스", "status": "published"},
        {"title": "ChatGPT 활용 가이드", "content": "ChatGPT를 효율적으로 활용하는 방법...", "category": "AI 도구", "status": "published"},
        {"title": "블록체인과 AI의 만남", "content": "블록체인 기술과 AI의 융합...", "category": "기술 분석", "status": "draft"},
        {"title": "메타버스 플랫폼 비교", "content": "주요 메타버스 플랫폼들을 비교 분석...", "category": "기술 분석", "status": "published"},
        {"title": "자동화 도구 추천", "content": "업무 자동화를 위한 최고의 도구들...", "category": "활용 팁", "status": "published"}
    ]
    
    for post_data in sample_posts:
        post = schemas.PostCreate(**post_data)
        db_post = crud.create_post(db, post)
        # 현실적인 조회수, 좋아요, 공유, 댓글 수 추가
        db_post.views = random.randint(50, 300)
        db_post.likes = random.randint(3, 25)
        db_post.shares = random.randint(1, 8)
        db_post.comments = random.randint(0, 12)
        db.commit()
    
    # 샘플 인사이트 생성
    sample_insights = [
        {"title": "성과 트렌드", "content": "최근 7일간 조회수가 25% 증가했습니다.", "insight_type": "performance"},
        {"title": "독자 패턴", "content": "평일 저녁 시간대에 가장 높은 참여율을 보입니다.", "insight_type": "audience"},
        {"title": "인기 키워드", "content": "'AI', '자동화', '생산성' 키워드가 높은 관심을 받고 있습니다.", "insight_type": "keyword"},
        {"title": "개선 제안", "content": "더 많은 이미지를 추가하면 참여율이 향상될 것입니다.", "insight_type": "improvement"}
    ]
    
    for insight_data in sample_insights:
        insight = schemas.InsightCreate(**insight_data)
        crud.create_insight(db, insight)
    
    # 샘플 트렌딩 키워드 생성
    sample_keywords = [
        {"keyword": "#AI", "popularity_score": 95.5, "category": "tech"},
        {"keyword": "#ChatGPT", "popularity_score": 89.2, "category": "tech"},
        {"keyword": "#자동화", "popularity_score": 78.8, "category": "business"},
        {"keyword": "#블록체인", "popularity_score": 72.1, "category": "tech"},
        {"keyword": "#메타버스", "popularity_score": 65.4, "category": "trending"}
    ]
    
    for keyword_data in sample_keywords:
        keyword = schemas.TrendKeywordCreate(**keyword_data)
        crud.create_trend_keyword(db, keyword)
    
    # 샘플 사용자 활동 생성
    for i in range(50):
        activity_data = {
            "session_id": f"session_{i}",
            "page_url": f"/post/{random.randint(1, 5)}",
            "time_spent": random.uniform(30, 300),
            "user_agent": "Mozilla/5.0",
            "referrer": "https://google.com"
        }
        activity = schemas.UserActivityCreate(**activity_data)
        crud.create_user_activity(db, activity)
    
    return {"message": "샘플 데이터가 성공적으로 생성되었습니다!"}

@app.post("/api/reset-data")
def reset_all_data(db: Session = Depends(get_db)):
    """모든 데이터를 초기화합니다 (실제 사용자 상태로 리셋)"""
    try:
        # 모든 데이터 삭제
        db.query(models.Post).delete()
        db.query(models.Insight).delete()
        db.query(models.TrendKeyword).delete()
        db.query(models.UserActivity).delete()
        db.commit()
        
        return {"message": "모든 데이터가 초기화되었습니다. 이제 실제 사용자 상태입니다."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"데이터 초기화 실패: {str(e)}")