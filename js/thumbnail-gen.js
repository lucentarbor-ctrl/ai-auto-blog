async function generateThumbnail() {
    const title = document.getElementById('thumb-title').value;
    const style = document.querySelector('input[name="thumb-style"]:checked').value;
    const resultDiv = document.getElementById('thumbnail-result');

    if (!title) {
        alert('썸네일 텍스트를 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 썸네일을 생성 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/generate-thumbnail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: title, style: style }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Display the generated image
        resultDiv.innerHTML = `<img src="${data.image_url}" alt="Generated Thumbnail" style="max-width: 100%; border-radius: 8px;">`;

    } catch (error) {
        console.error('Error generating thumbnail:', error);
        resultDiv.innerHTML = `<p style="color: red;">썸네일 생성에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
