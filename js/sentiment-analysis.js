async function analyzeSentiment() {
    const text = document.getElementById('sentiment-text').value;
    const resultDiv = document.getElementById('sentiment-result');

    if (!text) {
        alert('분석할 텍스트를 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 텍스트의 감정을 분석 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/analyze-sentiment', {
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

        let sentimentIcon = '';
        let sentimentText = '';
        switch (data.sentiment) {
            case 'positive': 
                sentimentIcon = '<i class="fas fa-smile-beam fa-3x" style="color: var(--color-success);"></i>'; 
                sentimentText = '긍정적';
                break;
            case 'negative': 
                sentimentIcon = '<i class="fas fa-frown-open fa-3x" style="color: var(--color-danger);"></i>'; 
                sentimentText = '부정적';
                break;
            default:
                sentimentIcon = '<i class="fas fa-meh fa-3x" style="color: var(--text-tertiary);"></i>';
                sentimentText = '중립적';
                break;
        }

        resultDiv.innerHTML = `
            <div style="text-align: center;">
                ${sentimentIcon}
                <h3 style="margin-top: 15px;">${sentimentText}</h3>
                <p style="color: var(--text-secondary);">신뢰도: ${(data.confidence * 100).toFixed(1)}%</p>
            </div>
        `;

    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        resultDiv.innerHTML = `<p style="color: red;">감정 분석에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
