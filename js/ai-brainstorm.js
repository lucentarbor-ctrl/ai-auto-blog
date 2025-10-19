async function startBrainstorm() {
    const topic = document.getElementById('brainstorm-topic').value;
    const resultDiv = document.getElementById('brainstorm-result');

    if (!topic) {
        alert('브레인스토밍 시작 주제를 입력해주세요.');
        return;
    }

    resultDiv.innerHTML = '<p style="color: #999;">AI가 주제에 대한 아이디어를 생성 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/brainstorm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: topic }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Format the results into an HTML list
        if (data.ideas && data.ideas.length > 0) {
            let finalHtml = "<ul>";
            data.ideas.forEach(idea => {
                finalHtml += `<li>${idea}</li>`;
            });
            finalHtml += "</ul>";
            resultDiv.innerHTML = finalHtml;
        } else {
            resultDiv.innerHTML = '<p style="color: #999;">관련 아이디어를 찾지 못했습니다.</p>';
        }

    } catch (error) {
        console.error('Error during brainstorming:', error);
        resultDiv.innerHTML = `<p style="color: red;">브레인스토밍에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}
