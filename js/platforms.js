async function loadPlatforms() {
    const container = document.getElementById('platform-list');
    if (!container) return;

    container.innerHTML = '<p style="color: #999;">플랫폼 목록을 불러오는 중...</p>';

    try {
        const response = await fetch('http://localhost:8001/api/platforms');
        if (!response.ok) throw new Error('Failed to fetch platforms.');
        
        const platforms = await response.json();

        container.innerHTML = Object.keys(platforms).map(key => {
            const platform = platforms[key];
            const isConnected = platform.status === 'connected';
            return `
            <div class="platform-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-plug" style="font-size: 20px; color: ${isConnected ? 'var(--color-success)' : 'var(--text-tertiary)'}"></i>
                    <div>
                        <h4 style="margin: 0;">${platform.name}</h4>
                        <span style="font-size: 13px; color: ${isConnected ? 'var(--color-success)' : 'var(--text-secondary)'}">${isConnected ? '연결됨' : '연결 끊김'}</span>
                    </div>
                </div>
                <button 
                    class="btn ${isConnected ? 'btn-secondary' : 'btn-primary'}" 
                    onclick="${isConnected ? `disconnectPlatform('${key}')` : `connectPlatform('${key}')`}">
                    ${isConnected ? '연결 해제' : '연결'}
                </button>
            </div>
        `}).join('');

    } catch (error) {
        console.error('Error loading platforms:', error);
        container.innerHTML = '<p style="color: red;">플랫폼 목록을 불러오는 데 실패했습니다.</p>';
    }
}

async function connectPlatform(platformName) {
    try {
        const response = await fetch(`http://localhost:8001/api/platforms/${platformName}/connect`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to connect.');
        const data = await response.json();
        showToast(data.message);
        loadPlatforms();
    } catch (error) {
        showToast('플랫폼 연결에 실패했습니다.', 'error');
    }
}

async function disconnectPlatform(platformName) {
    try {
        const response = await fetch(`http://localhost:8001/api/platforms/${platformName}/disconnect`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to disconnect.');
        const data = await response.json();
        showToast(data.message);
        loadPlatforms();
    } catch (error) {
        showToast('플랫폼 연결 해제에 실패했습니다.', 'error');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const platformsTab = document.querySelector('a[onclick="showTab(\'platforms\')"]');
    if (platformsTab) {
        platformsTab.addEventListener('click', loadPlatforms);
    }
});