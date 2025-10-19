async function startSeoAnalysis() {
    const text = document.getElementById('seo-text').value;
    const keyword = document.getElementById('seo-keyword').value;
    const resultDiv = document.getElementById('seo-result');

    if (!text || !keyword) {
        alert('분석할 텍스트와 타겟 키워드를 모두 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 SEO를 분석 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/analyze-seo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text, keyword: keyword }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Format the results into HTML
        let finalHtml = `
            <div class="seo-score-display">
                <h4>종합 SEO 점수</h4>
                <div class="score-circle">${data.overall_score}</div>
            </div>
            <div class="seo-details">
                <h4>세부 분석</h4>
                <ul>
                    <li><strong>타겟 키워드:</strong> ${data.keyword}</li>
                    <li><strong>총 단어 수:</strong> ${data.word_count}</li>
                    <li><strong>키워드 수:</strong> ${data.keyword_count}</li>
                </ul>
                <h4>개선 제안</h4>
                <ul>
                    ${data.improvements.map(item => `<li><i class="fas fa-wrench"></i> ${item}</li>`).join('') || '<li><i class="fas fa-check-circle"></i> 특별한 개선 제안이 없습니다. 잘 작성되었습니다!</li>'}
                </ul>
            </div>
        `;

        resultDiv.innerHTML = finalHtml;

    } catch (error) {
        console.error('Error during SEO analysis:', error);
        resultDiv.innerHTML = `<p style="color: red;">SEO 분석에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
