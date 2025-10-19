async function analyzeTrends() {
    const resultDiv = document.getElementById('trends-result');
    if (!resultDiv) return;

    resultDiv.innerHTML = '<p style="color: #999;">AI가 최신 뉴스를 기반으로 트렌드를 분석 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/trending-topics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.trends && data.trends.length > 0) {
            let finalHtml = '<div class="trend-list">';
            data.trends.forEach(trend => {
                const changeIcon = trend.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                const changeColor = trend.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
                finalHtml += `
                    <div class="trend-item">
                        <span class="trend-topic">${trend.topic}</span>
                        <span class="trend-score">트렌드 점수: ${trend.score}</span>
                        <span class="trend-change" style="color: ${changeColor}">
                            <i class="fas ${changeIcon}"></i> ${Math.abs(trend.change)}
                        </span>
                    </div>
                `;
            });
            finalHtml += '</div>';
            resultDiv.innerHTML = finalHtml;
        } else {
            resultDiv.innerHTML = '<p style="color: #999;">분석할 트렌드가 없습니다.</p>';
        }

    } catch (error) {
        console.error('Error analyzing trends:', error);
        resultDiv.innerHTML = `<p style="color: red;">트렌드 분석에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
