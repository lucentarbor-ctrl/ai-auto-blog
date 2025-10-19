async function loadFeedback() {
    const container = document.getElementById('feedback-list-container');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">독자 피드백을 불러오는 중...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/feedback');
        if (!response.ok) throw new Error('Failed to fetch feedback.');
        
        const data = await response.json();

        if (!data.feedback || data.feedback.length === 0) {
            container.innerHTML = '<p style="color: #999;">표시할 피드백이 없습니다.</p>';
            return;
        }

        container.innerHTML = data.feedback.map(item => {
            let sentimentIcon = '';
            switch (item.sentiment) {
                case 'positive': sentimentIcon = '<i class="fas fa-smile" style="color: var(--color-success);"></i>'; break;
                case 'negative': sentimentIcon = '<i class="fas fa-frown" style="color: var(--color-danger);"></i>'; break;
                default: sentimentIcon = '<i class="fas fa-meh" style="color: var(--text-tertiary);"></i>'; break;
            }
            return `
            <div class="feedback-item" style="border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 20px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h5 style="margin:0;">${item.user} 님의 댓글</h5>
                    <span title="감정 분석 결과">${sentimentIcon}</span>
                </div>
                <p style="margin: 0 0 10px 0;">"${item.comment}"</p>
                <small style="color: var(--text-secondary);">관련 글: ${item.post_title}</small>
            </div>
        `}).join('');

    } catch (error) {
        console.error('Error loading feedback:', error);
        container.innerHTML = '<p style="color: red;">피드백을 불러오는 데 실패했습니다.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const feedbackTab = document.querySelector('a[onclick="showTab(\'feedback\')"]');
    if (feedbackTab) {
        feedbackTab.addEventListener('click', loadFeedback);
    }
});