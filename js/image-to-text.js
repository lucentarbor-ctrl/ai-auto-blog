async function extractTextFromImage() {
    const fileInput = document.getElementById('image-upload');
    const resultDiv = document.getElementById('image-to-text-result');

    if (fileInput.files.length === 0) {
        alert('이미지 파일을 선택해주세요.');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('image_file', file);

    resultDiv.innerHTML = '<p style="color: #999;">AI가 이미지에서 텍스트를 추출 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/media/image-to-text', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        resultDiv.innerHTML = `<p>${data.extracted_text}</p>`;

    } catch (error) {
        console.error('Error extracting text from image:', error);
        resultDiv.innerHTML = `<p style="color: red;">텍스트 추출에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
