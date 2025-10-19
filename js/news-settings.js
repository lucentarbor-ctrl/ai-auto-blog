let currentKeywords = [];
let currentSources = [];

async function loadCrawlingSettings() {
    try {
        const response = await fetch('http://localhost:8001/api/settings/crawling');
        if (!response.ok) throw new Error('Failed to fetch settings.');
        const settings = await response.json();
        
        currentKeywords = settings.keywords || [];
        currentSources = settings.sources || [];
        
        updateKeywordListUI();
        updateSourceCheckboxesUI();

    } catch (error) {
        console.error('Error loading crawling settings:', error);
        showToast('크롤링 설정을 불러오는 데 실패했습니다.', 'error');
    }
}

function updateKeywordListUI() {
    const container = document.getElementById('keywordList');
    if (!container) return;
    if (currentKeywords.length === 0) {
        container.innerHTML = '<p style="color: #999; font-size: 14px;">추가된 키워드가 없습니다.</p>';
        return;
    }
    container.innerHTML = currentKeywords.map(keyword => `
        <span class="keyword-tag">
            ${keyword}
            <button onclick="removeNewsKeyword('${keyword}')">×</button>
        </span>
    `).join('');
}

function updateSourceCheckboxesUI() {
    document.querySelectorAll('input[name="newsSources"]').forEach(checkbox => {
        checkbox.checked = currentSources.includes(checkbox.value);
    });
}

async function updateSettingsOnBackend() {
    try {
        const response = await fetch('http://localhost:8001/api/settings/crawling', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords: currentKeywords, sources: currentSources })
        });
        if (!response.ok) throw new Error('Failed to update settings.');
        showToast('설정이 저장되었습니다!');
    } catch (error) {
        console.error('Error updating settings:', error);
        showToast('설정 저장에 실패했습니다.', 'error');
    }
}

function addNewsKeyword() {
    const keywordInput = document.getElementById('newsKeyword');
    const keyword = keywordInput.value.trim();
    if (keyword && !currentKeywords.includes(keyword)) {
        currentKeywords.push(keyword);
        updateKeywordListUI();
        updateSettingsOnBackend();
        keywordInput.value = '';
    }
}

function removeNewsKeyword(keyword) {
    currentKeywords = currentKeywords.filter(k => k !== keyword);
    updateKeywordListUI();
    updateSettingsOnBackend();
}

function saveNewsSources() {
    const selectedSources = Array.from(document.querySelectorAll('input[name="newsSources"]:checked')).map(cb => cb.value);
    currentSources = selectedSources;
    updateSettingsOnBackend();
}

async function startNewsCrawl() {
    showToast('AI 뉴스 크롤링을 시작합니다...');
    try {
        const response = await fetch('http://localhost:8001/api/crawling/run', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to start crawling.');
        const data = await response.json();
        showToast(data.message);
    } catch (error) {
        console.error('Error starting crawl:', error);
        showToast('크롤링 시작에 실패했습니다.', 'error');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const newsSetupTab = document.querySelector('a[onclick="showTab(\'news-setup\')"]');
    if (newsSetupTab) {
        newsSetupTab.addEventListener('click', loadCrawlingSettings);
    }

    document.querySelectorAll('input[name="newsSources"]').forEach(checkbox => {
        checkbox.addEventListener('change', saveNewsSources);
    });
});
