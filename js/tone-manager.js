async function changeTone() {
    const originalText = document.getElementById('tone-original-text').value;
    const selectedTone = document.querySelector('input[name="tone"]:checked').value;
    const resultDiv = document.getElementById('tone-result');

    if (!originalText) {
        alert('원본 텍스트를 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 텍스트 톤을 변경 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/change-tone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: originalText,
                tone: selectedTone,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        resultDiv.innerHTML = data.changed_text;

    } catch (error) {
        console.error('Error changing tone:', error);
        resultDiv.innerHTML = `<p style="color: red;">톤 변경에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
