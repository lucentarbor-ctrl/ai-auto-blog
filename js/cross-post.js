async function loadCrossPostData() {
    const postSelect = document.getElementById('cross-post-select');
    const platformList = document.getElementById('cross-post-platform-list');

    if (!postSelect || !platformList) return;

    try {
        // Fetch posts
        const postsResponse = await fetch('http://localhost:8001/api/posts?status=published');
        const posts = await postsResponse.json();
        postSelect.innerHTML = posts.map(p => `<option value="${p.id}">${p.title}</option>`).join('');

        // Fetch platforms
        const platformsResponse = await fetch('http://localhost:8001/api/platforms');
        const platforms = await platformsResponse.json();
        platformList.innerHTML = Object.keys(platforms).map(key => {
            const platform = platforms[key];
            if (platform.status !== 'connected') return ''; // Only show connected platforms
            return `
                <label class="checkbox-label">
                    <input type="checkbox" name="cross-post-platforms" value="${key}" checked>
                    <span>${platform.name}</span>
                </label>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading data for cross-posting:', error);
        platformList.innerHTML = '<p style="color: red;">데이터 로딩 실패</p>';
    }
}

async function startCrossPost() {
    const postId = document.getElementById('cross-post-select').value;
    const selectedPlatforms = Array.from(document.querySelectorAll('input[name="cross-post-platforms"]:checked')).map(cb => cb.value);
    const resultDiv = document.getElementById('cross-post-result');

    if (!postId) {
        alert('발행할 포스트를 선택하세요.');
        return;
    }
    if (selectedPlatforms.length === 0) {
        alert('발행할 플랫폼을 하나 이상 선택하세요.');
        return;
    }

    resultDiv.innerHTML = '<p>동시 발행을 시작합니다...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/posts/cross-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: parseInt(postId), platforms: selectedPlatforms }),
        });

        if (!response.ok) throw new Error('Failed to cross-post.');

        const data = await response.json();
        resultDiv.innerHTML = data.log.map(line => `<p>${line}</p>`).join('');

    } catch (error) {
        console.error('Error during cross-posting:', error);
        resultDiv.innerHTML = '<p style="color: red;">동시 발행에 실패했습니다.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const crossPostTab = document.querySelector('a[onclick="showTab(\'cross-post\')"]');
    if (crossPostTab) {
        crossPostTab.addEventListener('click', loadCrossPostData);
    }
});
