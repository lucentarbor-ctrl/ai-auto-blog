async function loadPerformanceData() {
    const container = document.getElementById('performance-dashboard-container');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">콘텐츠 성과 데이터를 분석 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/analytics/performance');
        if (!response.ok) throw new Error('Failed to fetch performance data.');
        
        const data = await response.json();

        if (!data.top_posts || data.top_posts.length === 0) {
            container.innerHTML = '<p style="color: #999;">분석할 발행된 포스트가 없습니다.</p>';
            return;
        }

        let finalHtml = '<h4>상위 성과 포스트 Top 5</h4>';
        data.top_posts.forEach((post, index) => {
            finalHtml += `
            <div class="performance-item" style="display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); margin-bottom: 10px;">
                <div class="rank" style="font-size: 20px; font-weight: bold; color: var(--accent-primary);">#${index + 1}</div>
                <div style="flex: 1;">
                    <h5 style="margin: 0;">${post.title}</h5>
                    <div style="display: flex; gap: 20px; font-size: 13px; color: var(--text-secondary); margin-top: 5px;">
                        <span><i class="fas fa-eye"></i> ${post.views.toLocaleString()}</span>
                        <span><i class="fas fa-heart"></i> ${post.likes.toLocaleString()}</span>
                        <span><i class="fas fa-comments"></i> ${post.comments.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            `;
        });

        container.innerHTML = finalHtml;

    } catch (error) {
        console.error('Error loading performance data:', error);
        container.innerHTML = '<p style="color: red;">성과 데이터를 불러오는 데 실패했습니다.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const performanceTab = document.querySelector('a[onclick="showTab(\'performance\')"]');
    if (performanceTab) {
        performanceTab.addEventListener('click', loadPerformanceData);
    }
});