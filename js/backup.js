async function loadBackups() {
    const container = document.getElementById('backup-list');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">백업 목록을 불러오는 중...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/backups');
        if (!response.ok) throw new Error('Failed to fetch backups.');
        
        const data = await response.json();

        if (!data.backups || data.backups.length === 0) {
            container.innerHTML = '<p style="color: #999;">생성된 백업이 없습니다.</p>';
            return;
        }

        container.innerHTML = data.backups.map(item => `
            <div class="backup-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); margin-bottom: 10px;">
                <div>
                    <strong style="color: var(--text-primary);">${item.name}</strong>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 5px;">
                        <span>생성일: ${new Date(item.created_at).toLocaleString('ko-KR')}</span> | 
                        <span>크기: ${item.size_kb} KB</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="downloadBackup('${item.name}')"><i class="fas fa-download"></i> 다운로드</button>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading backups:', error);
        container.innerHTML = '<p style="color: red;">백업 목록을 불러오는 데 실패했습니다.</p>';
    }
}

async function createBackup() {
    try {
        const response = await fetch('http://localhost:8001/api/backups', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to create backup.');
        const data = await response.json();
        showToast(data.message);
        loadBackups();
    } catch (error) {
        showToast('백업 생성에 실패했습니다.', 'error');
    }
}

function downloadBackup(fileName) {
    alert(`'${fileName}' 백업 파일을 다운로드합니다. (기능 구현 필요)`);
}

document.addEventListener('DOMContentLoaded', () => {
    const backupTab = document.querySelector('a[onclick="showTab(\'backup\')"]');
    if (backupTab) {
        backupTab.addEventListener('click', loadBackups);
    }
});