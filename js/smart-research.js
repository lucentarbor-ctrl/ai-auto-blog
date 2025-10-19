async function startResearch() {
    const query = document.getElementById('research-query').value;
    const resultDiv = document.getElementById('research-result');

    if (!query) {
        alert('리서치 주제를 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 리서치를 수행 중입니다... (웹 검색 및 요약 중)</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/research', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Display the rich HTML summary from the backend
        let finalHtml = data.summary;

        if (data.sources && data.sources.length > 0) {
            finalHtml += "<h4>참고 자료:</h4><ul class='source-list'>";
            data.sources.forEach(source => {
                finalHtml += `<li><a href="${source.url}" target="_blank">${source.title}</a></li>`;
            });
            finalHtml += "</ul>";
        }

        resultDiv.innerHTML = finalHtml;

    } catch (error) {
        console.error('Error performing research:', error);
        resultDiv.innerHTML = `<p style="color: red;">리서치에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
