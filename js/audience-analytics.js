async function loadAudienceData() {
    const container = document.getElementById('audience-analytics-container');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">독자 분석 데이터를 불러오는 중...</p>';

    try {
        // Use the apiClient and the correct endpoint, defaulting to 30 days
        const data = await window.apiClient.getAnalyticsByPeriod(30);
        renderAudienceCharts(data);

    } catch (error) {
        console.error('Error loading audience data:', error);
        container.innerHTML = '<p style="color: red;">독자 분석 데이터를 불러오는 데 실패했습니다.</p>';
    }
}

function renderAudienceCharts(data) {
    const container = document.getElementById('audience-analytics-container');
    
    let finalHtml = '<div class="analytics-grid">';

    // Age Demographics - Display a message since data is not available
    finalHtml += '<div class="chart-container">';
    finalHtml += '<h4>연령대별 분포</h4>';
    finalHtml += '<p style="color: #999; text-align: center; padding: 20px;">연령대별 분석 데이터는 현재 제공되지 않습니다.</p>';
    finalHtml += '</div>';

    // Top Referrers - Render the new data if it exists
    if (data.top_referrers && data.top_referrers.length > 0) {
        finalHtml += '<div class="chart-container">';
        finalHtml += '<h4>상위 유입 경로</h4>';
        data.top_referrers.forEach(item => {
            finalHtml += `
                <div class="bar-chart-bar">
                    <div class="bar-label">${item.source}</div>
                    <div class="bar-wrapper">
                        <div class="bar-fill" style="width: ${item.value}%; background-color: var(--accent-primary);">${item.value}%</div>
                    </div>
                </div>
            `;
        });
        finalHtml += '</div>';
    } else {
        finalHtml += '<div class="chart-container">';
        finalHtml += '<h4>상위 유입 경로</h4>';
        finalHtml += '<p style="color: #999; text-align: center; padding: 20px;">유입 경로 데이터가 없습니다.</p>';
        finalHtml += '</div>';
    }

    // Also display the other stats available from the endpoint
    if(data.page_views !== undefined) {
        finalHtml += '<div class="chart-container"><h4>페이지 뷰</h4><div class="single-stat">${data.page_views}</div></div>';
    }
    if(data.unique_visitors !== undefined) {
        finalHtml += '<div class="chart-container"><h4>순 방문자</h4><div class="single-stat">${data.unique_visitors}</div></div>';
    }
    if(data.avg_session_duration !== undefined) {
        finalHtml += '<div class="chart-container"><h4>평균 세션 시간</h4><div class="single-stat">${data.avg_session_duration}s</div></div>';
    }
     if(data.bounce_rate !== undefined) {
        finalHtml += '<div class="chart-container"><h4>이탈률</h4><div class="single-stat">${data.bounce_rate}%</div></div>';
    }

    finalHtml += '</div>';
    container.innerHTML = finalHtml;
}

document.addEventListener('DOMContentLoaded', () => {
    const audienceTab = document.querySelector('a[onclick="showTab(\'audience\')"]');
    if (audienceTab) {
        // Load data when the tab is first clicked
        audienceTab.addEventListener('click', loadAudienceData, { once: true });
    }
});
