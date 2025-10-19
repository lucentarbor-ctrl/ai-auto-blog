async function generateTemplate() {
    const templateType = document.getElementById('template-category').value;
    const topic = document.getElementById('template-topic').value;
    const keywords = document.getElementById('template-keywords').value;
    const resultDiv = document.getElementById('template-result');

    if (!topic || !keywords) {
        alert('주제와 키워드를 모두 입력해주세요.');
        return;
    }

    // Show loading state
    resultDiv.innerHTML = '<p style="color: #999;">AI가 템플릿을 생성 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/templates/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                template_type: templateType,
                topic: topic,
                keywords: keywords,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Display the result
        resultDiv.innerHTML = data.generated_text;

    } catch (error) {
        console.error('Error generating template:', error);
        resultDiv.innerHTML = `<p style="color: red;">템플릿 생성에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
