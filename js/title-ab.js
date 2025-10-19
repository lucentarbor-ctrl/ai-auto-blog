async function startAbTest() {
    const titleA = document.getElementById('title-a').value;
    const titleB = document.getElementById('title-b').value;
    const resultDiv = document.getElementById('title-ab-result');

    if (!titleA || !titleB) {
        alert('두 개의 제목을 모두 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 두 제목의 성과를 예측 분석 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/ab-test-title', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title_a: titleA, title_b: titleB }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Format the results into HTML
        let finalHtml = `
            <div class="ab-test-summary">
                <h4>AI 예측 승자: <span class="winner-badge">제목 ${data.winner}</span></h4>
                <p>${data.suggestion}</p>
            </div>
            <div class="ab-test-details">
                <div class="title-card ${data.winner === 'A' ? 'winner' : ''}">
                    <h5>제목 A</h5>
                    <p>"${data.title_a.title}"</p>
                    <span>예상 클릭률: ${data.title_a.predicted_ctr}</span>
                </div>
                <div class="title-card ${data.winner === 'B' ? 'winner' : ''}">
                    <h5>제목 B</h5>
                    <p>"${data.title_b.title}"</p>
                    <span>예상 클릭률: ${data.title_b.predicted_ctr}</span>
                </div>
            </div>
        `;

        resultDiv.innerHTML = finalHtml;

    } catch (error) {
        console.error('Error during A/B test:', error);
        resultDiv.innerHTML = `<p style="color: red;">A/B 테스트에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
