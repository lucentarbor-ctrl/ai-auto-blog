async function loadCollectedNews() {
    const container = document.getElementById('news-list-container');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">수집된 뉴스를 불러오는 중...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/news');
        if (!response.ok) throw new Error('Failed to fetch news.');
        
        const newsItems = await response.json();

        if (newsItems.length === 0) {
            container.innerHTML = '<p style="color: #999;">수집된 뉴스가 없습니다.</p>';
            return;
        }

        container.innerHTML = newsItems.map(item => `
            <div class="news-item" style="border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 20px; margin-bottom: 15px;">
                <h4>${item.title}</h4>
                <p style="color: var(--text-secondary); font-size: 14px; margin-top: 5px;">${item.summary}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <div style="font-size: 13px; color: var(--text-tertiary);">
                        <span><strong>출처:</strong> ${item.source}</span> | 
                        <span><strong>수집일:</strong> ${new Date(item.crawled_date).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="processNewsItem(${item.id})" ${item.processed ? 'disabled' : ''}>
                        <i class="fas fa-cogs"></i> ${item.processed ? '처리 완료' : '포스트로 변환'}
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading collected news:', error);
        container.innerHTML = '<p style="color: red;">뉴스 목록을 불러오는 데 실패했습니다.</p>';
    }
}

async function processNewsItem(newsId) {
    try {
        const response = await fetch(`http://localhost:8001/api/news/${newsId}/process`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to process news item.');
        
        const data = await response.json();
        showToast(data.message || '뉴스가 처리되었습니다.');
        loadCollectedNews(); // Refresh the list to show the updated status

    } catch (error) {
        console.error('Error processing news item:', error);
        showToast('뉴스 처리에 실패했습니다.', 'error');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const newsCollectedTab = document.querySelector('a[onclick="showTab(\'news-collected\')"]');
    if (newsCollectedTab) {
        newsCollectedTab.addEventListener('click', loadCollectedNews);
    }
});
