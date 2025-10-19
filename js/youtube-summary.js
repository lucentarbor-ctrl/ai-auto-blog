async function summarizeYoutube() {
    const url = document.getElementById('youtube-url').value;
    const resultDiv = document.getElementById('youtube-summary-result');

    if (!url) {
        alert('유튜브 동영상 URL을 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 유튜브 동영상을 분석하고 요약 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/media/summarize-youtube', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        resultDiv.innerHTML = data.summary;

    } catch (error) {
        console.error('Error summarizing youtube video:', error);
        resultDiv.innerHTML = `<p style="color: red;">유튜브 요약에 실패했습니다: ${error.message}</p>`;
    }
}
