async function loadPublishQueue() {
    const container = document.getElementById('publish-queue-list');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">예약된 포스트 목록을 불러오는 중...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/posts?status=scheduled');
        if (!response.ok) throw new Error('Failed to fetch scheduled posts.');
        
        const posts = await response.json();

        if (posts.length === 0) {
            container.innerHTML = '<p style="color: #999;">현재 예약 발행 대기 중인 포스트가 없습니다.</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="queue-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); margin-bottom: 10px;">
                <div>
                    <h4 style="margin: 0;">${post.title}</h4>
                    <span style="font-size: 13px; color: var(--text-secondary);">
                        ${new Date(post.scheduled_time || Date.now()).toLocaleString('ko-KR')} 발행 예정
                    </span>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="cancelScheduledPost(${post.id})">발행 취소</button>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading publish queue:', error);
        container.innerHTML = '<p style="color: red;">발행 큐를 불러오는 데 실패했습니다.</p>';
    }
}

function cancelScheduledPost(postId) {
    // This would call a backend endpoint to change the post status
    alert(`포스트 ID ${postId}의 예약 발행을 취소합니다. (기능 구현 필요)`);
}


document.addEventListener('DOMContentLoaded', () => {
    const queueTab = document.querySelector('a[onclick="showTab(\'publish-queue\')"]');
    if (queueTab) {
        queueTab.addEventListener('click', loadPublishQueue);
    }
});