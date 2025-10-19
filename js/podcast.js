async function generatePodcast() {
    const text = document.getElementById('podcast-text').value;
    const voice = document.getElementById('podcast-voice').value;
    const resultDiv = document.getElementById('podcast-result');

    if (!text) {
        alert('음성으로 변환할 텍스트를 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 음성을 생성 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text, voice: voice }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Create and display the audio player
        resultDiv.innerHTML = `
            <audio controls autoplay>
                <source src="${data.audio_url}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        `;

    } catch (error) {
        console.error('Error generating podcast:', error);
        resultDiv.innerHTML = `<p style="color: red;">음성 생성에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
