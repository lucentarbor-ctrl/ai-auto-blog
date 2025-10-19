async function loadPreferences() {
    const themeSelect = document.getElementById('pref-theme');
    const langSelect = document.getElementById('pref-language');
    if (!themeSelect || !langSelect) return;

    try {
        const response = await fetch('http://localhost:8001/api/settings/preferences');
        if (!response.ok) throw new Error('Failed to fetch preferences.');
        
        const prefs = await response.json();
        themeSelect.value = prefs.theme;
        langSelect.value = prefs.language;

    } catch (error) {
        console.error('Error loading preferences:', error);
        showToast('환경설정을 불러오는 데 실패했습니다.', 'error');
    }
}

async function savePreferences() {
    const theme = document.getElementById('pref-theme').value;
    const language = document.getElementById('pref-language').value;

    try {
        const response = await fetch('http://localhost:8001/api/settings/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme: theme, language: language })
        });

        if (!response.ok) throw new Error('Failed to save preferences.');

        showToast('환경설정이 저장되었습니다!');
        // Here you might apply the theme, e.g., document.body.className = theme;

    } catch (error) {
        console.error('Error saving preferences:', error);
        showToast('환경설정 저장에 실패했습니다.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const prefsTab = document.querySelector('a[onclick="showTab(\'preferences\')"]');
    if (prefsTab) {
        prefsTab.addEventListener('click', loadPreferences);
    }
});