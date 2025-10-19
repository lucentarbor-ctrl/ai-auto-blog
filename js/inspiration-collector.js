async function loadInspirations() {
    const container = document.getElementById('inspiration-list');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">수집된 영감을 불러오는 중...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/inspirations');
        if (!response.ok) throw new Error('Failed to fetch inspirations.');
        
        const inspirations = await response.json();

        if (inspirations.length === 0) {
            container.innerHTML = '<p style="color: #999; grid-column: 1/-1;">아직 수집된 영감이 없습니다.</p>';
            return;
        }

        container.innerHTML = inspirations.map(item => `
            <div class="idea-card">
                <h4>${item.title || '제목 없음'}</h4>
                <p>${item.note || ''}</p>
                <div class="idea-meta">
                    <span><i class="fas fa-link"></i> <a href="${item.url}" target="_blank">${item.url}</a></span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading inspirations:', error);
        container.innerHTML = '<p style="color: red; grid-column: 1/-1;">영감을 불러오는 데 실패했습니다.</p>';
    }
}

async function saveInspiration() {
    const url = document.getElementById('inspiration-url').value;
    const note = document.getElementById('inspiration-note').value;

    if (!url) {
        alert('URL을 입력해주세요.');
        return;
    }

    try {
        const response = await fetch('http://localhost:8001/api/inspirations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url, note: note })
        });

        if (!response.ok) throw new Error('Failed to save inspiration.');

        showToast('새로운 영감이 저장되었습니다!');
        document.getElementById('inspiration-url').value = '';
        document.getElementById('inspiration-note').value = '';
        loadInspirations(); // Refresh the list

    } catch (error) {
        console.error('Error saving inspiration:', error);
        showToast('영감 저장에 실패했습니다.', 'error');
    }
}

// Add a listener to load inspirations when the tab is shown
document.addEventListener('DOMContentLoaded', () => {
    const inspirationTab = document.querySelector('a[onclick="showTab(\'inspiration\')"]');
    if(inspirationTab) {
        inspirationTab.addEventListener('click', loadInspirations);
    }
});
