async function loadMilestones() {
    const container = document.getElementById('milestone-list');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">마일스톤 목록을 불러오는 중...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/milestones');
        if (!response.ok) throw new Error('Failed to fetch milestones.');
        
        const milestones = await response.json();

        if (milestones.length === 0) {
            container.innerHTML = '<p style="color: #999;">설정된 마일스톤이 없습니다.</p>';
            return;
        }

        container.innerHTML = milestones.map(m => `
            <div class="milestone-item" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600;">${m.title}</span>
                    <span style="font-size: 13px; color: var(--text-secondary);">목표일: ${m.due_date || '미지정'}</span>
                </div>
                <div class="progress-bar-container" style="background: #e9ecef; border-radius: 20px; height: 20px; overflow: hidden;">
                    <div class="progress-bar-fill" style="width: ${m.progress}%; background: var(--accent-primary); height: 100%; transition: width 0.5s ease; text-align: center; color: white; line-height: 20px; font-size: 12px;">
                        ${m.progress}%
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading milestones:', error);
        container.innerHTML = '<p style="color: red;">마일스톤을 불러오는 데 실패했습니다.</p>';
    }
}

async function addMilestone() {
    const title = document.getElementById('milestone-title').value;
    const dueDate = document.getElementById('milestone-due-date').value;

    if (!title) {
        alert('마일스톤 제목을 입력해주세요.');
        return;
    }

    try {
        const response = await fetch('http://localhost:8001/api/milestones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, due_date: dueDate })
        });

        if (!response.ok) throw new Error('Failed to add milestone.');

        showToast('새로운 마일스톤이 추가되었습니다!');
        document.getElementById('milestone-title').value = '';
        document.getElementById('milestone-due-date').value = '';
        loadMilestones(); // Refresh the list

    } catch (error) {
        console.error('Error adding milestone:', error);
        showToast('마일스톤 추가에 실패했습니다.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const milestoneTab = document.querySelector('a[onclick="showTab(\'milestone\')"]');
    if (milestoneTab) {
        milestoneTab.addEventListener('click', loadMilestones);
    }
});