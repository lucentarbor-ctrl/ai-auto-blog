function updateDashboard() {
    console.log("Fetching dashboard stats from the backend...");
    fetch('http://localhost:8001/api/stats')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Received stats:", data);

            // API 응답(data)을 기반으로 대시보드 카드 업데이트
            // API는 today_posts, scheduled_posts, ai_news_count 등을 제공합니다.
            // HTML의 data-stat 속성과 매핑합니다.

            // '발행 글' 카드 업데이트 (API의 published_posts 사용)
            const publishedPostsCard = document.querySelector('.stat-card[data-stat="publishedPosts"] .stat-value');
            if (publishedPostsCard) {
                publishedPostsCard.textContent = data.published_posts || 0;
            }

            // API 데이터로 통계 업데이트
            const totalViewsCard = document.querySelector('.stat-card[data-stat="totalViews"] .stat-value');
            if (totalViewsCard) {
                totalViewsCard.textContent = data.total_views || 'N/A';
            }

            const subscribersCard = document.querySelector('.stat-card[data-stat="subscribers"] .stat-value');
            if (subscribersCard) {
                subscribersCard.textContent = data.subscribers || 'N/A';
            }

            const engagementCard = document.querySelector('.stat-card[data-stat="engagement"] .stat-value');
            if (engagementCard) {
                engagementCard.textContent = `${data.engagement_rate || 'N/A'}%`;
            }

            console.log("Dashboard updated with backend data.");
        })
        .catch(error => {
            console.error('Error fetching dashboard stats:', error);
            // 에러 발생 시 대시보드에 에러 메시지 표시
            const dashboardGrid = document.querySelector('.dashboard-grid');
            if(dashboardGrid) {
                dashboardGrid.innerHTML = `<p style="color: red; text-align: center;">대시보드 데이터를 불러오는 데 실패했습니다. 백엔드 서버가 실행 중인지 확인하세요. (포트: 8001)</p>`;
            }
        });
}

// 페이지 로드 시 대시보드 데이터 자동 업데이트
document.addEventListener('DOMContentLoaded', updateDashboard);
