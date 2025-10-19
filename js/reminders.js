async function loadReminders() {
    const container = document.getElementById('reminder-list');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">리마인더 목록을 불러오는 중...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/reminders');
        if (!response.ok) throw new Error('Failed to fetch reminders.');
        
        const reminders = await response.json();

        if (reminders.length === 0) {
            container.innerHTML = '<p style="color: #999;">활성 리마인더가 없습니다.</p>';
            return;
        }

        container.innerHTML = reminders.map(r => `
            <div class="reminder-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); margin-bottom: 10px;">
                <span>${r.text}</span>
                <button class="btn btn-sm btn-secondary" onclick="deleteReminder(${r.id})"><i class="fas fa-check"></i></button>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading reminders:', error);
        container.innerHTML = '<p style="color: red;">리마인더를 불러오는 데 실패했습니다.</p>';
    }
}

async function addReminder() {
    const input = document.getElementById('reminder-text');
    const text = input.value;

    if (!text) {
        alert('리마인더 내용을 입력해주세요.');
        return;
    }

    try {
        const response = await fetch('http://localhost:8001/api/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) throw new Error('Failed to add reminder.');

        showToast('리마인더가 추가되었습니다!');
        input.value = '';
        loadReminders(); // Refresh the list

    } catch (error) {
        console.error('Error adding reminder:', error);
        showToast('리마인더 추가에 실패했습니다.', 'error');
    }
}

function deleteReminder(id) {
    // This would call a DELETE endpoint in a real app
    alert(`리마인더 ID ${id}를 완료 처리합니다. (기능 구현 필요)`);
}

document.addEventListener('DOMContentLoaded', () => {
    const remindersTab = document.querySelector('a[onclick="showTab(\'reminders\')"]');
    if (remindersTab) {
        remindersTab.addEventListener('click', loadReminders);
    }
});