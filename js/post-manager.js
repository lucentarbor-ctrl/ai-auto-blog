function loadPosts(status = null) {
    let apiUrl = 'http://127.0.0.1:8003/api/posts';
    if (status) {
        apiUrl += `?status=${status}`;
    }
    const container = document.getElementById('postsList');
    if (!container) return;
    container.innerHTML = '<p style="color: #999;">글 목록을 불러오는 중...</p>';

    fetch(apiUrl)
        .then(response => response.json())
        .then(posts => {
            if (posts.length === 0) {
                container.innerHTML = '<p style="color: #999;">해당 상태의 글이 없습니다.</p>';
                return;
            }
            container.innerHTML = posts.map(post => `
                <div class="post-item">
                    <div>
                        <h4>${post.title}</h4>
                        <div class="post-meta">
                            <span><i class="fas fa-folder"></i> ${post.category}</span>
                            <span><i class="fas fa-calendar"></i> ${new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                            <span class="badge ${post.status === 'published' ? 'new' : 'beta'}">${post.status}</span>
                        </div>
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editPost(${post.id})"><i class="fas fa-edit"></i> 수정</button>
                        <button class="btn btn-sm btn-secondary" onclick="deletePost(${post.id})"><i class="fas fa-trash"></i> 삭제</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            container.innerHTML = '<p style="color: red;">글 목록을 불러오는 데 실패했습니다.</p>';
        });
}

async function savePost(status) {
    const title = document.getElementById('smartPostTitle').value;
    const content = document.getElementById('smartPostContent').innerHTML;
    const category = document.getElementById('smartPostCategory').value;
    const series_id = document.getElementById('smartPostSeries').value;
    const tags = document.getElementById('smartPostTags').value.split(',').map(t => t.trim()).filter(t => t);
    const editingId = document.getElementById('smart-write-panel').dataset.editingId;

    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }

    const postData = { title, content, category, tags, status, series_id: series_id ? parseInt(series_id, 10) : null };
    const url = editingId ? `http://127.0.0.1:8003/api/posts/${editingId}` : 'http://127.0.0.1:8003/api/posts';
    const method = editingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });
        if (!response.ok) throw new Error('Failed to save post.');
        
        showToast(`글이 성공적으로 ${status === 'draft' ? '임시저장' : '발행'}되었습니다!`);
        clearEditor();
        showTab('posts');
        loadPosts(); // Refresh the main post list

    } catch (error) {
        showToast('저장에 실패했습니다.', 'error');
    }
}

async function deletePost(id) {
    if (!confirm('정말로 이 글을 삭제하시겠습니까? 데이터베이스에서 영구적으로 삭제됩니다.')) return;

    try {
        const response = await fetch(`http://127.0.0.1:8003/api/posts/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete post.');
        showToast('글이 삭제되었습니다.', 'error');
        loadPosts(); // Refresh the list
    } catch (error) {
        showToast('삭제에 실패했습니다.', 'error');
    }
}

async function editPost(id) {
    try {
        const response = await fetch(`http://127.0.0.1:8003/api/posts/${id}`);
        if (!response.ok) throw new Error('Failed to fetch post details.');
        const post = await response.json();

        showTab('smart-write');
        document.getElementById('smartPostTitle').value = post.title;
        document.getElementById('smartPostContent').innerHTML = post.content;
        document.getElementById('smartPostCategory').value = post.category;
        document.getElementById('smartPostSeries').value = post.series_id || '';
        document.getElementById('smartPostTags').value = post.tags.join(', ');
        document.getElementById('smart-write-panel').dataset.editingId = id;

        showToast('글을 수정합니다. 저장 또는 발행 버튼을 눌러주세요.');

    } catch (error) {
        showToast('글 정보를 불러오는 데 실패했습니다.', 'error');
    }
}

function clearEditor() {
    document.getElementById('smartPostTitle').value = '';
    document.getElementById('smartPostContent').innerHTML = '<p style="color: #999;">내용을 입력하세요.</p>';
    document.getElementById('smartPostCategory').value = '';
    document.getElementById('smartPostTags').value = '';
    delete document.getElementById('smart-write-panel').dataset.editingId;
}

// Overwrite placeholder functions from main HTML
window.saveDraft = () => savePost('draft');
window.publishPost = () => savePost('published');
window.editPost = editPost;
window.deletePost = deletePost;
window.loadPosts = loadPosts;

async function restoreVersion(versionId) {
    try {
        const version = await apiClient.getPostVersion(versionId);
        showTab('smart-write');
        document.getElementById('smartPostTitle').value = version.title;
        if (smartEditorQuill) {
            smartEditorQuill.root.innerHTML = version.content;
        }
        // Do not set editingId, let the user decide to save as new or update.
        showToast(`버전 #${version.id}의 내용으로 복원되었습니다.`, 'success');
    } catch (error) {
        showToast('버전 복원에 실패했습니다.', 'error');
    }
}
window.restoreVersion = restoreVersion;
