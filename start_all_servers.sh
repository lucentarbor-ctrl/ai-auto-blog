#!/bin/bash

# 가상환경 활성화
source .venv/bin/activate

echo "🚀 AI 자동 블로깅 시스템 전체 시작..."
echo "================================"

# 1. AI 뉴스 크롤러 시작
echo "1. AI 뉴스 크롤러 서버 시작 (포트 5001)..."
cd backend
python news_crawler.py &
NEWS_PID=$!
echo "   뉴스 크롤러 PID: $NEWS_PID"

# 2. AI 글쓰기 도우미 시작
echo "2. AI 글쓰기 도우미 서버 시작 (포트 5002)..."
python ai_assistant.py &
AI_PID=$!
echo "   AI 도우미 PID: $AI_PID"

# 3. 프론트엔드 서버 시작
echo "3. 프론트엔드 서버 시작 (포트 8080)..."
cd ..
python -m http.server 8080 &
FRONTEND_PID=$!
echo "   프론트엔드 PID: $FRONTEND_PID"

echo "================================"
echo "✅ 모든 서버가 시작되었습니다!"
echo ""
echo "🌐 접속 주소:"
echo "   기본 버전: http://localhost:8080/integrated-autoblog.html"
echo "   AI 강화 버전: http://localhost:8080/ai-integrated-blog.html"
echo "   슬래시 명령어 테스트: http://localhost:8080/slash-command-test.html"
echo ""
echo "📡 API 서버:"
echo "   뉴스 크롤러: http://localhost:5001"
echo "   AI 도우미: http://localhost:5002"
echo ""
echo "종료하려면 Ctrl+C를 누르세요"
echo "================================"

# 종료 처리
trap "echo '서버를 종료합니다...'; kill $NEWS_PID $AI_PID $FRONTEND_PID; exit" INT

# 서버 유지
wait