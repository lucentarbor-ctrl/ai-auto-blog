async function generatePodcastNotes() {
    const url = document.getElementById('podcast-url').value;
    const resultDiv = document.getElementById('podcast-notes-result');

    if (!url) {
        alert('팟캐스트 오디오 URL을 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 팟캐스트를 분석하고 노트를 생성 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/media/podcast-notes', {
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

        resultDiv.innerHTML = data.notes;

    } catch (error) {
        console.error('Error generating podcast notes:', error);
        resultDiv.innerHTML = `<p style="color: red;">팟캐스트 노트 생성에 실패했습니다: ${error.message}</p>`;
    }
}
