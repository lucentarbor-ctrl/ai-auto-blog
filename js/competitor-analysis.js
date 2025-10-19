async function analyzeCompetitor() {
    const url = document.getElementById('competitor-url').value;
    const resultDiv = document.getElementById('competitor-result');

    if (!url) {
        alert('분석할 경쟁사 URL을 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 경쟁사 블로그를 분석 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/analytics/competitor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        let finalHtml = `
            <div class="analytics-grid" style="grid-template-columns: 1fr 2fr;">
                <div class="stat-card">
                    <h4>월 추정 방문자</h4>
                    <div class="stat-value">~${(data.estimated_monthly_visits / 10000).toFixed(1)}만</div>
                </div>
                <div class="chart-container">
                    <h4>상위 유입 키워드 Top 5</h4>
                    ${data.top_keywords.map(k => `
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid var(--border-color);">
                            <span><strong>#${k.rank}</strong> ${k.keyword}</span>
                        </div>`).join('')}
                </div>
            </div>
            <div class="summary" style="margin-top: 20px;">
                <h4>AI 종합 분석</h4>
                <p>${data.summary}</p>
            </div>
        `;

        resultDiv.innerHTML = finalHtml;

    } catch (error) {
        console.error('Error during competitor analysis:', error);
        resultDiv.innerHTML = `<p style="color: red;">경쟁사 분석에 실패했습니다: ${error.message}</p>`;
    }
}
