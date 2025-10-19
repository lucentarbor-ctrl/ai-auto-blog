async function loadEngagementData() {
    const container = document.getElementById('engagement-analytics-container');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">참여도 데이터를 분석 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/analytics/engagement');
        if (!response.ok) throw new Error('Failed to fetch engagement data.');
        
        const data = await response.json();
        renderEngagementCharts(data);

    } catch (error) {
        console.error('Error loading engagement data:', error);
        container.innerHTML = '<p style="color: red;">참여도 데이터를 불러오는 데 실패했습니다.</p>';
    }
}

function renderEngagementCharts(data) {
    const container = document.getElementById('engagement-analytics-container');
    
    let finalHtml = '<div class="analytics-grid">';

    // Stat cards for average likes and comments
    finalHtml += `
        <div class="stat-card">
            <h4>포스트당 평균 좋아요</h4>
            <div class="stat-value">${data.avg_likes_per_post}</div>
        </div>
        <div class="stat-card">
            <h4>포스트당 평균 댓글</h4>
            <div class="stat-value">${data.avg_comments_per_post}</div>
        </div>
    `;

    finalHtml += '</div>';

    // Engagement over time chart
    finalHtml += '<div class="chart-container" style="margin-top: 30px;">';
    finalHtml += '<h4>시간에 따른 참여도 변화 (%)</h4>';
    data.engagement_over_time.forEach(item => {
        finalHtml += `
            <div class="bar-chart-bar">
                <div class="bar-label">${item.month}</div>
                <div class="bar-wrapper">
                    <div class="bar-fill" style="width: ${item.value * 10}%;">${item.value}%</div>
                </div>
            </div>
        `;
    });
    finalHtml += '</div>';

    container.innerHTML = finalHtml;
}

document.addEventListener('DOMContentLoaded', () => {
    const engagementTab = document.querySelector('a[onclick="showTab(\'engagement\')"]');
    if (engagementTab) {
        engagementTab.addEventListener('click', loadEngagementData);
    }
});
