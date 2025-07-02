# AI 자동 블로그 시스템

개인용 AI 기반 자동 블로깅 시스템으로, 다양한 플랫폼에 자동으로 글을 발행할 수 있는 통합 솔루션입니다.

## 🚀 프로젝트 개요

이 프로젝트는 블로그 작성, 관리, 자동 발행을 위한 개인용 도구입니다. AI를 활용한 글쓰기 도우미, 뉴스 크롤링, 멀티플랫폼 발행 등의 기능을 제공합니다.

### 주요 특징
- 📝 AI 글쓰기 도우미 (슬래시 명령어 지원)
- 📰 AI 뉴스 자동 수집 및 요약
- 📅 예약 발행 시스템
- 🎯 멀티플랫폼 동시 발행
- 📊 실시간 대시보드 및 분석
- 🎓 온라인 강좌 통합 관리

## 🌐 라이브 데모

- **AWS S3**: http://ai-blog-frontend-1750017109.s3-website.ap-northeast-2.amazonaws.com/full-featured-blog.html
- **GitHub 저장소**: https://github.com/ray1derer/ai-auto-blog

## 📁 프로젝트 구조

```
ai-auto-blog/
├── index.html                 # 메인 페이지
├── full-featured-blog.html    # 전체 기능 통합 버전
├── css/
│   └── styles.css            # 메인 스타일시트
├── js/
│   ├── main.js               # 메인 JavaScript
│   ├── dashboard.js          # 대시보드 관리
│   ├── post-manager.js       # 글 관리 모듈
│   ├── category-manager.js   # 카테고리 관리
│   ├── news-api.js           # 뉴스 API 연동
│   ├── ai-writer.js          # AI 글쓰기 도우미
│   └── course-data.js        # 강좌 데이터
└── backend/
    ├── app.py                # Flask 백엔드
    └── news_crawler.py       # 뉴스 크롤러
```

## 🛠️ 주요 기능

### 1. AI 글쓰기 도우미
- `/` 명령어로 AI 기능 활성화
- 자동 제목 생성
- 개요 작성
- SEO 최적화 체크
- 톤 일관성 검사

### 2. 콘텐츠 관리
- **글 관리**: 작성, 수정, 삭제, 카테고리 분류
- **카테고리 관리**: 동적 카테고리 생성 및 관리
- **아이디어 뱅크**: 아이디어 저장 및 글로 발전
- **시리즈 관리**: 연재물 체계적 관리

### 3. 온라인 강좌 통합
- **노션 마스터 클래스** (30강)
- **옵시디언 마스터 클래스** (35강)
- **Evoto 마스터 클래스** (40강)

### 4. 자동화 기능
- **AI 뉴스 크롤링**: Google News, Reddit, Hacker News, arXiv
- **예약 발행**: 날짜/시간 지정 발행
- **멀티플랫폼 발행**: 여러 블로그 플랫폼 동시 발행 (준비 중)

### 5. 분석 및 인사이트
- **실시간 대시보드**: 조회수, 구독자, 참여율 통계
- **인기 콘텐츠 분석**: 가장 많이 읽힌 글 추적
- **독자 인사이트**: 독자 행동 패턴 분석
- **성과 보고서**: Excel/PDF 형식 내보내기

## 🔧 기술 스택

### Frontend
- HTML5 / CSS3 / JavaScript (Vanilla)
- Font Awesome 아이콘
- LocalStorage 기반 데이터 저장
- 반응형 디자인

### Backend
- Python Flask
- BeautifulSoup4 (웹 크롤링)
- Feedparser (RSS 파싱)
- CORS 지원

### 배포
- AWS S3 정적 웹사이트 호스팅
- GitHub Pages (백업)

## 📝 설치 및 실행

### Frontend
```bash
# 저장소 클론
git clone https://github.com/ray1derer/ai-auto-blog.git
cd ai-auto-blog

# 로컬 서버 실행 (Python)
python -m http.server 8080

# 브라우저에서 접속
http://localhost:8080/full-featured-blog.html
```

### Backend (선택사항)
```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
pip install -r requirements.txt

# Flask 서버 실행
python app.py
```

## 🚀 배포 방법

### AWS S3 배포
```bash
# S3 버킷에 동기화
aws s3 sync . s3://your-bucket-name/ \
  --exclude ".git/*" \
  --exclude "backend/*" \
  --delete

# 정적 웹사이트 호스팅 활성화
aws s3 website s3://your-bucket-name/ \
  --index-document index.html \
  --error-document error.html
```

## 📋 사용법

### 글 작성
1. 사이드바에서 "AI 글쓰기" → "스마트 에디터" 클릭
2. 제목과 내용 입력
3. `/` 입력으로 AI 도우미 활용
4. 카테고리와 태그 설정
5. "발행하기" 또는 "임시저장" 클릭

### 강좌 관리
1. 사이드바에서 "글 관리" 클릭
2. 노션/옵시디언/Evoto 마스터 클래스 선택
3. 각 강좌의 전체 레슨 목록 확인
4. "강좌 보기" 버튼으로 실제 강좌 페이지 이동

### AI 뉴스 수집
1. "AI 뉴스" → "크롤링 설정" 이동
2. 키워드 추가 (예: ChatGPT, AI)
3. 뉴스 소스 선택
4. "지금 수집하기" 클릭

## 🔄 업데이트 내역

### 2025.07.02
- 강좌를 별도 메뉴에서 글 관리 카테고리로 통합
- course-data.js 파일로 모든 강좌 정보 중앙 관리
- showCourseCategory() 함수로 강좌별 글 목록 표시

### 2025.07.01
- 전체 기능 통합 버전 출시
- LocalStorage 기반 실시간 대시보드 구현
- AI 글쓰기 슬래시 명령어 기능 추가
- 50+ 메뉴 아이템 통합

### 2025.06.30
- 초기 버전 출시
- AI 뉴스 크롤링 백엔드 구현
- 멀티플랫폼 발행 인터페이스 설계

## 🤝 기여 방법

이 프로젝트는 개인용으로 개발되었지만, 개선 사항이나 버그 리포트는 언제든 환영합니다.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

- GitHub: [@ray1derer](https://github.com/ray1derer)
- 프로젝트 링크: [https://github.com/ray1derer/ai-auto-blog](https://github.com/ray1derer/ai-auto-blog)

---

🤖 Generated with [Claude Code](https://claude.ai/code)