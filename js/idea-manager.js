async function loadIdeas() {
    const container = document.getElementById('ideasGrid');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">아이디어를 불러오는 중...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ideas');
        if (!response.ok) throw new Error('Failed to fetch ideas.');
        
        const ideas = await response.json();

        if (ideas.length === 0) {
            container.innerHTML = '<p style="color: #999; grid-column: 1/-1;">아직 저장된 아이디어가 없습니다.</p>';
            return;
        }

        container.innerHTML = ideas.map(idea => `
            <div class="idea-card" id="idea-card-${idea.id}">
                <p>${idea.content}</p>
                <div class="idea-meta">
                    <span><i class="fas fa-calendar"></i> ${new Date(idea.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                <button class="btn btn-sm btn-primary" onclick="developIdea(${idea.id}, `${encodeURIComponent(idea.content)}`)">
                    <i class="fas fa-magic"></i> 글로 발전시키기
                </button>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading ideas:', error);
        container.innerHTML = '<p style="color: red; grid-column: 1/-1;">아이디어를 불러오는 데 실패했습니다.</p>';
    }
}

async function addNewIdea() {
    const content = prompt('새로운 아이디어:');
    if (content) {
        try {
            const response = await fetch('http://localhost:8001/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content })
            });

            if (!response.ok) throw new Error('Failed to save idea.');

            showToast('새 아이디어가 저장되었습니다!');
            loadIdeas(); // Refresh the list

        } catch (error) {
            console.error('Error saving idea:', error);
            showToast('아이디어 저장에 실패했습니다.', 'error');
        }
    }
}

function developIdea(ideaId, encodedContent) {
    const content = decodeURIComponent(encodedContent);
    if (content) {
        showTab('smart-write');
        document.getElementById('smartPostTitle').value = content.substring(0, 50);
        document.getElementById('smartPostContent').innerHTML = `<p>${content}</p>`;
        showToast('아이디어를 바탕으로 글쓰기를 시작합니다!');
    }
}
