async function analyzeOptimalTimes() {
    const container = document.getElementById('heatmap-container');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">AI가 독자 활동 패턴을 분석 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/analyze-optimal-times', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to analyze optimal times.');
        
        const data = await response.json();
        renderHeatmap(data.heatmap);

    } catch (error) {
        console.error('Error analyzing optimal times:', error);
        container.innerHTML = '<p style="color: red;">최적 시간 분석에 실패했습니다.</p>';
    }
}

function renderHeatmap(heatmapData) {
    const container = document.getElementById('heatmap-container');
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    
    let gridHtml = '<div class="heatmap-grid">';

    // Header row (hours)
    gridHtml += '<div class="heatmap-label"></div>'; // Empty corner
    for (let i = 0; i < 24; i++) {
        gridHtml += `<div class="heatmap-label">${i}</div>`;
    }

    // Data rows (days)
    heatmapData.forEach((rowData, dayIndex) => {
        gridHtml += `<div class="heatmap-label">${days[dayIndex]}</div>`;
        rowData.forEach(score => {
            const opacity = score / 100;
            gridHtml += `<div class="heatmap-cell" style="background-color: rgba(74, 105, 189, ${opacity})" title="참여도: ${score}"></div>`;
        });
    });

    gridHtml += '</div>';
    container.innerHTML = gridHtml;
}
