async function loadAudienceData() {
    const container = document.getElementById('audience-analytics-container');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">독자 분석 데이터를 불러오는 중...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/analytics/audience');
        if (!response.ok) throw new Error('Failed to fetch audience data.');
        
        const data = await response.json();
        renderAudienceCharts(data);

    } catch (error) {
        console.error('Error loading audience data:', error);
        container.innerHTML = '<p style="color: red;">독자 분석 데이터를 불러오는 데 실패했습니다.</p>';
    }
}

function renderAudienceCharts(data) {
    const container = document.getElementById('audience-analytics-container');
    
    let finalHtml = '<div class="analytics-grid">';

    // Age Demographics
    finalHtml += '<div class="chart-container">';
    finalHtml += '<h4>연령대별 분포</h4>';
    data.demographics.age.forEach(item => {
        finalHtml += `
            <div class="bar-chart-bar">
                <div class="bar-label">${item.range}</div>
                <div class="bar-wrapper">
                    <div class="bar-fill" style="width: ${item.value}%;">${item.value}%</div>
                </div>
            </div>
        `;
    });
    finalHtml += '</div>';

    // Top Referrers
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

    finalHtml += '</div>';
    container.innerHTML = finalHtml;
}

document.addEventListener('DOMContentLoaded', () => {
    const audienceTab = document.querySelector('a[onclick="showTab(\'audience\')"]');
    if (audienceTab) {
        audienceTab.addEventListener('click', loadAudienceData);
    }
});