async function generateSocialCard() {
    const text = document.getElementById('social-text').value;
    const platform = document.getElementById('social-platform').value;
    const resultDiv = document.getElementById('social-card-result');

    if (!text) {
        alert('카드에 넣을 핵심 문구를 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 SNS 카드를 생성 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/generate-social-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text, platform: platform }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Display the generated image
        resultDiv.innerHTML = `<img src="${data.image_url}" alt="Generated Social Card" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 8px;">`;

    } catch (error) {
        console.error('Error generating social card:', error);
        resultDiv.innerHTML = `<p style="color: red;">SNS 카드 생성에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
