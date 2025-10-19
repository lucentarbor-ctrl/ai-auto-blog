async function loadPostsForEbook() {
    const container = document.getElementById('ebook-post-list');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">포스트 목록을 불러오는 중...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/posts');
        if (!response.ok) throw new Error('Failed to fetch posts.');
        
        const posts = await response.json();

        if (posts.length === 0) {
            container.innerHTML = '<p style="color: #999;">전자책에 포함할 포스트가 없습니다.</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <label class="checkbox-label">
                <input type="checkbox" name="ebook-posts" value="${post.id}">
                <span>${post.title} (${post.status})</span>
            </label>
        `).join('');

    } catch (error) {
        console.error('Error loading posts for ebook:', error);
        container.innerHTML = '<p style="color: red;">포스트 목록을 불러오는 데 실패했습니다.</p>';
    }
}

async function generateEbook() {
    const title = document.getElementById('ebook-title').value;
    const selectedPostCheckboxes = document.querySelectorAll('input[name="ebook-posts"]:checked');
    const resultDiv = document.getElementById('ebook-result');

    if (!title) {
        alert('전자책 제목을 입력해주세요.');
        return;
    }

    if (selectedPostCheckboxes.length === 0) {
        alert('전자책에 포함할 포스트를 하나 이상 선택해주세요.');
        return;
    }

    const postIds = Array.from(selectedPostCheckboxes).map(cb => parseInt(cb.value));

    resultDiv.innerHTML = '<p style="color: #999;">전자책을 생성 중입니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/ai/generate-ebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, post_ids: postIds }),
        });

        if (!response.ok) throw new Error('Failed to generate eBook.');

        const data = await response.json();
        resultDiv.innerHTML = data.ebook_content;

    } catch (error) {
        console.error('Error generating eBook:', error);
        resultDiv.innerHTML = `<p style="color: red;">전자책 생성에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
    }
}

// Add a listener to load posts when the ebook tab is shown
document.addEventListener('DOMContentLoaded', () => {
    const ebookTab = document.querySelector('a[onclick="showTab(\'ebook\')"]');
    if(ebookTab) {
        ebookTab.addEventListener('click', loadPostsForEbook);
    }
});