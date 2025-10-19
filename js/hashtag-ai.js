async function generateHashtags() {
    const text = document.getElementById('hashtag-text').value;
    const resultDiv = document.getElementById('hashtag-result');

    if (!text) {
        alert('분석할 텍스트를 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 해시태그를 분석/추천 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/generate-hashtags', {
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

        // Format the results into HTML tags
        if (data.hashtags && data.hashtags.length > 0) {
            resultDiv.innerHTML = data.hashtags.map(tag => `<span class="keyword-tag">${tag}</span>`).join('');
        } else {
            resultDiv.innerHTML = '<p style="color: #999;">추천할 해시태그를 찾지 못했습니다.</p>';
        }

    } catch (error) {
        console.error('Error generating hashtags:', error);
        resultDiv.innerHTML = `<p style="color: red;">해시태그 생성에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
