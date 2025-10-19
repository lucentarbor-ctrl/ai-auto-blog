async function analyzeVirality() {
    const url = document.getElementById('viral-url').value;
    const resultDiv = document.getElementById('viral-result');

    if (!url) {
        alert('분석할 포스트 URL을 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 콘텐츠의 바이럴 가능성을 분석 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/analytics/viral-analysis', {
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
            <div class="readability-score-display" style="margin-bottom: 30px;">
                <h4>바이럴 예측 점수</h4>
                <div class="score-circle">${data.virality_score}</div>
            </div>
            <div class="viral-factors">
                <h4>주요 영향 요인</h4>
                ${data.key_factors.map(factor => {
                    let impactColor = 'var(--text-secondary)';
                    if (factor.impact === 'high') impactColor = 'var(--color-success)';
                    if (factor.impact === 'low') impactColor = 'var(--color-danger)';
                    return `
                        <div class="factor-item" style="margin-bottom: 15px;">
                            <strong style="color: ${impactColor};">${factor.factor} (영향도: ${factor.impact})</strong>
                            <p style="font-size: 14px; color: var(--text-secondary); margin: 5px 0 0 0;">${factor.description}</p>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        resultDiv.innerHTML = finalHtml;

    } catch (error) {
        console.error('Error during viral analysis:', error);
        resultDiv.innerHTML = `<p style="color: red;">바이럴 분석에 실패했습니다: ${error.message}</p>`;
    }
}
