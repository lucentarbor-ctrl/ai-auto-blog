async function generateNewsletter() {
    const sourceType = document.getElementById('newsletter-source').value;
    const subject = document.getElementById('newsletter-subject').value;
    const resultDiv = document.getElementById('newsletter-result');

    if (!subject) {
        alert('뉴스레터 제목을 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 뉴스레터를 생성 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/generate-newsletter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ source_type: sourceType, subject: subject }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Display the generated HTML newsletter
        resultDiv.innerHTML = data.newsletter_html;

    } catch (error) {
        console.error('Error generating newsletter:', error);
        resultDiv.innerHTML = `<p style="color: red;">뉴스레터 생성에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
