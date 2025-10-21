#!/bin/bash
###############################################
# AI Auto Blog - 자동 배포 스크립트
# EC2 서버에서 실행하면 Git 변경사항 자동 감지
###############################################

REPO_DIR="$HOME/ai-auto-blog"
BRANCH="main"
CHECK_INTERVAL=10  # 10초마다 체크

cd "$REPO_DIR" || exit 1

echo "🚀 AI Auto Blog 자동 배포 스크립트 시작!"
echo "📂 디렉토리: $REPO_DIR"
echo "🌿 브랜치: $BRANCH"
echo "⏱️  체크 주기: ${CHECK_INTERVAL}초"
echo ""
echo "종료하려면 Ctrl+C를 누르세요."
echo "=========================================="
echo ""

while true; do
    # 현재 커밋 해시 저장
    BEFORE=$(git rev-parse HEAD)

    # 원격 저장소에서 최신 정보 가져오기
    git fetch origin $BRANCH --quiet

    # 최신 커밋 해시
    AFTER=$(git rev-parse origin/$BRANCH)

    # 변경사항이 있으면 업데이트
    if [ "$BEFORE" != "$AFTER" ]; then
        echo "🔄 [$(date '+%Y-%m-%d %H:%M:%S')] 새로운 업데이트 감지!"

        # Pull 실행
        git pull origin $BRANCH

        if [ $? -eq 0 ]; then
            echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] 업데이트 완료!"

            # 변경된 파일 목록 표시
            echo "📝 변경된 파일:"
            git diff --name-only $BEFORE $AFTER | sed 's/^/   - /'
            echo ""
        else
            echo "❌ [$(date '+%Y-%m-%d %H:%M:%S')] 업데이트 실패!"
        fi
    else
        # 변경사항 없음 (메시지 생략, 로그 깔끔하게)
        :
    fi

    # 대기
    sleep $CHECK_INTERVAL
done
