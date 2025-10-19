async function startFactCheck() {
    const text = document.getElementById('fact-check-text').value;
    const resultDiv = document.getElementById('fact-check-result');

    if (!text) {
        alert('팩트체크할 내용을 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 텍스트를 분석하고 사실 관계를 확인 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/fact-check', {
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
        let finalHtml = "";
        data.results.forEach(item => {
            let statusClass = '';
            let icon = '';
            switch (item.status) {
                case 'VERIFIED':
                    statusClass = 'verified';
                    icon = '<i class="fas fa-check-circle"></i>';
                    break;
                case 'NEEDS_IMPROVEMENT':
                    statusClass = 'needs-improvement';
                    icon = '<i class="fas fa-exclamation-circle"></i>';
                    break;
                case 'CANNOT_VERIFY':
                default:
                    statusClass = 'cannot-verify';
                    icon = '<i class="fas fa-question-circle"></i>';
                    break;
            }
            if (item.original_sentence.trim() !== '.') {
                 finalHtml += `
                    <div class="fact-check-item ${statusClass}">
                        <p class="original-sentence">${icon} ${item.original_sentence}</p>
                        <p class="correction"><strong>AI 코멘트:</strong> ${item.correction}</p>
                        ${item.source ? `<p class="source"><strong>출처:</strong> <a href="${item.source.url}" target="_blank">${item.source.title}</a></p>` : ''}
                    </div>
                `;
            }
        });

        resultDiv.innerHTML = finalHtml;

    } catch (error) {
        console.error('Error during fact check:', error);
        resultDiv.innerHTML = `<p style="color: red;">팩트체크에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
