async function generateDigest() {
    const resultDiv = document.getElementById('digest-result');
    if (!resultDiv) return;

    resultDiv.innerHTML = '<p style="color: #999;">AI가 오늘 수집된 뉴스로 다이제스트를 생성 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/generate-digest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        resultDiv.innerHTML = data.digest_html;

    } catch (error) {
        console.error('Error generating digest:', error);
        resultDiv.innerHTML = `<p style="color: red;">다이제스트 생성에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
