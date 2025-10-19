async function startRepurpose() {
    const text = document.getElementById('repurpose-text').value;
    const format = document.getElementById('repurpose-format').value;
    const resultDiv = document.getElementById('repurpose-result');

    if (!text) {
        alert('변환할 텍스트를 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 콘텐츠 포맷을 변환 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/repurpose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text, target_format: format }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        resultDiv.innerHTML = data.repurposed_text;

    } catch (error) {
        console.error('Error during repurposing:', error);
        resultDiv.innerHTML = `<p style="color: red;">포맷 변환에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
