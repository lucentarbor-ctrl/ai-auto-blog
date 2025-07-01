# 🚀 AI Auto Blog System

AI 자동 블로그 시스템 - 사이드바 UI와 자동화 기능을 갖춘 블로그 플랫폼

## 📋 주요 기능

### 🤖 AI 콘텐츠 자동화
- **AI 뉴스**: 실시간 크롤링 및 한국어 번역
- **트렌드 분석**: AI 업계 동향 자동 분석
- **콘텐츠 생성**: 3개 AI 모델 협업 (Claude, GPT-4, Gemini)

### 📚 강좌 시리즈
- **노션 마스터 클래스** (30강)
- **옵시디언 마스터 클래스** (35강)
- GitHub에서 자동 임포트 및 예약 발행

### ⚡ 자동화 시스템
- **예약 발행**: 콘텐츠별 최적 시간 자동 배정
- **일일 자동화**: 크롤링 → 분석 → 번역 → 발행
- **SEO 최적화**: 자동 메타 태그 생성

### 🎨 사이드바 UI
- 모든 기능에 빠른 접근
- 반응형 디자인
- 다크/라이트 모드 지원

## 🚀 빠른 시작

### 요구사항
- Python 3.9+
- Node.js 16+
- Redis (선택사항)

### 설치
```bash
# 백엔드 설치
cd backend
pip install -r requirements.txt

# 프론트엔드 설치
cd ../frontend
npm install

# 서버 실행
cd ../backend
python main.py
```

### 접속
- 메인 블로그: `http://localhost:8000`
- 관리자 페이지: `http://localhost:8000/admin/dashboard.html`

## 📂 프로젝트 구조
```
ai-auto-blog/
├── frontend/          # 프론트엔드
│   ├── index.html    # 메인 블로그
│   ├── admin/        # 관리자 페이지
│   └── css/js/       # 스타일/스크립트
├── backend/          # 백엔드 API
│   ├── main.py       # FastAPI 앱
│   ├── services/     # 비즈니스 로직
│   └── models/       # 데이터 모델
└── data/            # 데이터 저장소
    ├── courses/     # 강좌 콘텐츠
    └── posts/       # 블로그 포스트
```

## 🛠️ 기술 스택
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: FastAPI, SQLAlchemy
- **Database**: SQLite (개발), PostgreSQL (프로덕션)
- **AI**: OpenAI, Anthropic, Google AI APIs
- **Automation**: Celery, Redis (선택사항)

## 📝 라이선스
MIT License