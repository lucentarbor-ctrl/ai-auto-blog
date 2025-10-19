async function startReadabilityAnalysis() {
    const text = document.getElementById('readability-text').value;
    const resultDiv = document.getElementById('readability-result');

    if (!text) {
        alert('분석할 텍스트를 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 텍스트 가독성을 분석 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/analyze-readability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Format the results into HTML
        let finalHtml = `
            <div class="readability-score-display">
                <h4>가독성 점수</h4>
                <div class="score-circle ${data.level === '개선 필요' ? 'bad' : ''}">${data.score}</div>
                <span>${data.level}</span>
            </div>
            <div class="readability-details">
                <h4>세부 분석</h4>
                <ul>
                    <li><strong>총 단어 수:</strong> ${data.word_count}</li>
                    <li><strong>총 문장 수:</strong> ${data.sentence_count}</li>
                    <li><strong>평균 문장 길이:</strong> ${data.avg_sentence_length}</li>
                </ul>
                <h4>개선 팁</h4>
                <ul>
                    ${data.tips.map(item => `<li><i class="fas fa-lightbulb"></i> ${item}</li>`).join('')}
                </ul>
            </div>
        `;

        resultDiv.innerHTML = finalHtml;

    } catch (error) {
        console.error('Error during readability analysis:', error);
        resultDiv.innerHTML = `<p style="color: red;">가독성 분석에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
