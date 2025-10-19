// 실시간 대시보드 - 서버 연동 버전
class RealtimeDashboard {
    constructor() {
        this.refreshInterval = 30000; // 30초마다 새로고침
        this.intervalId = null;
    }

    async init() {
        await this.loadDashboardData();
        this.startAutoRefresh();
    }

    async loadDashboardData() {
        try {
            // 로딩 상태 표시
            this.showLoadingState();

            // 병렬로 모든 데이터 로드
            const [stats, insights, keywords, analytics] = await Promise.all([
                apiClient.getDashboardStats(),
                apiClient.getInsights(),
                apiClient.getTrendingKeywords(5),
                apiClient.getAnalyticsByPeriod(7)
            ]);

            // 데이터 렌더링
            this.renderStats(stats);
            this.renderInsights(insights);
            this.renderTrendingKeywords(keywords);
            this.renderAnalytics(analytics);

            // 로딩 상태 해제
            this.hideLoadingState();

        } catch (error) {
            console.error('대시보드 데이터 로드 실패:', error);
            this.showError('데이터를 불러올 수 없습니다.');
        }
    }

    renderStats(stats) {
        // 통계 카드 업데이트
        const statsHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-eye"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${this.formatNumber(stats.total_views)}</div>
                        <div class="stat-label">총 조회수</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.published_posts}</div>
                        <div class="stat-label">발행된 글</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-edit"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.draft_posts}</div>
                        <div class="stat-label">임시저장</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.engagement_rate.toFixed(1)}%</div>
                        <div class="stat-label">참여율</div>
                    </div>
                </div>
            </div>
        `;
        
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = statsHTML;
        }
    }

    renderInsights(insights) {
        const insightsHTML = insights.slice(0, 5).map(insight => `
            <div class="insight-card ${insight.priority}">
                <div class="insight-header">
                    <span class="insight-type">${this.getInsightIcon(insight.insight_type)}</span>
                    <span class="insight-time">${this.formatTime(insight.created_at)}</span>
                </div>
                <h4>${insight.title}</h4>
                <p>${insight.content}</p>
                ${!insight.is_read ? '<span class="badge new">NEW</span>' : ''}
            </div>
        `).join('');

        const insightsContainer = document.getElementById('insights-container');
        if (insightsContainer) {
            insightsContainer.innerHTML = insightsHTML || '<p>새로운 인사이트가 없습니다.</p>';
        }
    }

    renderTrendingKeywords(keywords) {
        const keywordsHTML = keywords.map(keyword => `
            <div class="keyword-tag">
                <span class="keyword-name">${keyword.keyword}</span>
                <div class="keyword-score">
                    <div class="score-bar" style="width: ${keyword.popularity_score}%"></div>
                </div>
                <span class="score-value">${keyword.popularity_score.toFixed(1)}</span>
            </div>
        `).join('');

        const keywordsContainer = document.getElementById('keywords-container');
        if (keywordsContainer) {
            keywordsContainer.innerHTML = keywordsHTML || '<p>트렌딩 키워드가 없습니다.</p>';
        }
    }

    renderAnalytics(analytics) {
        // 차트 렌더링 (Chart.js 사용)
        const chartContainer = document.getElementById('analytics-chart');
        if (chartContainer && window.Chart) {
            const ctx = chartContainer.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: analytics.labels || [],
                    datasets: [{
                        label: '페이지 뷰',
                        data: analytics.page_views || [],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }, {
                        label: '방문자',
                        data: analytics.visitors || [],
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: '7일 분석 트렌드'
                        }
                    }
                }
            });
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 3600000) { // 1시간 이내
            return Math.floor(diff / 60000) + '분 전';
        } else if (diff < 86400000) { // 24시간 이내
            return Math.floor(diff / 3600000) + '시간 전';
        } else {
            return Math.floor(diff / 86400000) + '일 전';
        }
    }

    getInsightIcon(type) {
        const icons = {
            'performance': '📈',
            'engagement': '💬',
            'trend': '🔥',
            'suggestion': '💡',
            'warning': '⚠️'
        };
        return icons[type] || '📊';
    }

    showLoadingState() {
        const containers = ['stats-container', 'insights-container', 'keywords-container'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = '<div class="loading-spinner">데이터 로딩 중...</div>';
            }
        });
    }

    hideLoadingState() {
        // 로딩 스피너 제거는 데이터 렌더링으로 자동 처리됨
    }

    showError(message) {
        const containers = ['stats-container', 'insights-container', 'keywords-container'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = `<div class="error-message">${message}</div>`;
            }
        });
    }

    startAutoRefresh() {
        this.intervalId = setInterval(() => {
            this.loadDashboardData();
        }, this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    destroy() {
        this.stopAutoRefresh();
    }
}

// 전역 대시보드 인스턴스
let dashboard = null;

// 대시보드 초기화
function initDashboard() {
    if (dashboard) {
        dashboard.destroy();
    }
    dashboard = new RealtimeDashboard();
    dashboard.init();
}

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('stats-container')) {
        initDashboard();
    }
});

// 전역 노출
window.RealtimeDashboard = RealtimeDashboard;
window.initDashboard = initDashboard;