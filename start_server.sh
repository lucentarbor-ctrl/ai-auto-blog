#!/bin/bash

echo "AI 자동 블로깅 시스템 시작..."
echo "================================"

# Python 가상환경 활성화
source .venv/bin/activate

# Python 백엔드 서버 시작
echo "1. AI 뉴스 크롤러 서버 시작 (포트 5001)..."
cd backend
pip install -r requirements.txt 2>/dev/null
python news_crawler.py &
BACKEND_PID=$!
echo "   백엔드 PID: $BACKEND_PID"

# 프론트엔드 서버 시작
echo "2. 프론트엔드 서버 시작 (포트 8080)..."
cd ..
python -m http.server 8080 &
FRONTEND_PID=$!
echo "   프론트엔드 PID: $FRONTEND_PID"

echo "================================"
echo "✅ 서버가 시작되었습니다!"
echo ""
echo "프론트엔드: http://localhost:8080/integrated-autoblog.html"
echo "백엔드 API: http://localhost:5001"
echo ""
echo "종료하려면 Ctrl+C를 누르세요"
echo "================================"

# 종료 처리
trap "echo '서버를 종료합니다...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# 서버 유지
wait