# AI 자동 블로깅 시스템

실시간 AI 뉴스 크롤링과 자동 블로그 포스팅을 지원하는 통합 시스템입니다.

## 🚀 주요 기능

### 1. 블로그 작성 & 관리
- 동적 카테고리 관리
- 태그 시스템
- 초안 저장
- 예약 발행 (날짜/시간 지정)
- 다중 플랫폼 동시 발행

### 2. AI 뉴스 크롤링 (실제 작동)
- **실시간 뉴스 수집**: Google News, Reddit, Hacker News, arXiv
- **키워드 기반 검색**: 원하는 키워드로 뉴스 필터링
- **자동 포스트 생성**: 수집된 뉴스를 블로그 포스트로 자동 변환
- **다국어 지원**: 한국어/영어 뉴스 수집

### 3. 유튜브 요약
- 동영상 URL로 내용 요약
- 블로그 포스트로 자동 변환

## 📋 설치 방법

### 1. 필수 요구사항
- Python 3.8+
- pip

### 2. 설치
```bash
# 저장소 클론
git clone https://github.com/ray1derer/ai-auto-blog.git
cd ai-auto-blog

# Python 패키지 설치
cd backend
pip install -r requirements.txt
```

## 🏃‍♂️ 실행 방법

### 방법 1: 통합 실행 (권장)
```bash
./start_server.sh
```

### 방법 2: 개별 실행
```bash
# 터미널 1: 백엔드 서버
cd backend
python news_crawler.py

# 터미널 2: 프론트엔드 서버
python -m http.server 8080
```

### 3. 접속
- 브라우저에서: http://localhost:8080/integrated-autoblog.html

## 📰 AI 뉴스 크롤링 사용법

1. **키워드 설정**
   - 사이드바에서 "AI 뉴스" → "크롤링 설정" 클릭
   - 관심 키워드 추가 (예: ChatGPT, AI, 인공지능)

2. **뉴스 소스 선택**
   - Google News: 일반 뉴스
   - Reddit: 커뮤니티 토론
   - Hacker News: 기술 뉴스
   - arXiv: 최신 논문

3. **뉴스 수집**
   - "지금 수집하기" 클릭
   - 수집된 뉴스는 자동으로 목록에 표시

4. **블로그 포스트 생성**
   - 수집된 뉴스에서 "포스트 생성" 클릭
   - 자동으로 정리된 내용이 에디터에 입력됨
   - 필요시 수정 후 발행

## 🛠️ 기술 스택

### 백엔드
- Flask (Python 웹 프레임워크)
- BeautifulSoup4 (웹 스크래핑)
- Feedparser (RSS 파싱)
- Requests (HTTP 요청)

### 프론트엔드
- Vanilla JavaScript
- LocalStorage (데이터 저장)
- Fetch API (백엔드 통신)

## 📱 지원 플랫폼

- 티스토리
- 네이버 블로그
- Velog
- Medium
- WordPress

## 🔧 환경 설정

### API 키 설정 (선택사항)
실제 플랫폼에 발행하려면 각 플랫폼의 API 키가 필요합니다:

```javascript
// js/config.js 생성
const API_KEYS = {
    tistory: 'YOUR_TISTORY_API_KEY',
    naver: 'YOUR_NAVER_API_KEY',
    // ...
}
```

## 📝 라이선스

MIT License

## 🤝 기여

Issue와 Pull Request를 환영합니다!

---

Made with ❤️ by AI Auto Blog Team