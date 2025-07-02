// AI 뉴스 API 연동
const NEWS_API_BASE = 'http://localhost:5001/api/news';

class NewsAPI {
    constructor() {
        this.apiBase = NEWS_API_BASE;
    }

    // 뉴스 크롤링
    async crawlNews(keywords, sources) {
        try {
            const response = await fetch(`${this.apiBase}/crawl`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    keywords: keywords,
                    sources: sources
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('뉴스 크롤링 오류:', error);
            throw error;
        }
    }

    // 뉴스 번역
    async translateNews(text) {
        try {
            const response = await fetch(`${this.apiBase}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('번역 오류:', error);
            throw error;
        }
    }

    // 뉴스 요약
    async summarizeNews(items) {
        try {
            const response = await fetch(`${this.apiBase}/summarize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: items })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('요약 오류:', error);
            throw error;
        }
    }

    // 뉴스를 블로그 포스트로 변환
    formatNewsAsPost(newsItems, keywords) {
        const today = new Date().toLocaleDateString('ko-KR');
        let content = `# ${today} AI 뉴스 정리\n\n`;
        content += `**키워드**: ${keywords.join(', ')}\n\n`;
        content += `**수집된 뉴스**: ${newsItems.length}개\n\n`;
        content += `---\n\n`;

        // 소스별로 그룹화
        const grouped = {};
        newsItems.forEach(item => {
            if (!grouped[item.source]) {
                grouped[item.source] = [];
            }
            grouped[item.source].push(item);
        });

        // 각 소스별로 정리
        Object.entries(grouped).forEach(([source, items]) => {
            content += `## 📰 ${source}\n\n`;
            
            items.slice(0, 5).forEach((item, index) => {
                content += `### ${index + 1}. ${item.title}\n`;
                content += `- **링크**: [원문 보기](${item.link})\n`;
                if (item.published) {
                    content += `- **발행일**: ${new Date(item.published).toLocaleDateString('ko-KR')}\n`;
                }
                if (item.summary) {
                    content += `- **요약**: ${item.summary.substring(0, 200)}...\n`;
                }
                if (item.points) {
                    content += `- **점수**: ${item.points}점 (댓글 ${item.num_comments}개)\n`;
                }
                content += `\n`;
            });
        });

        return {
            title: `[AI 뉴스] ${today} - ${keywords.join(', ')} 관련 소식`,
            content: content,
            tags: ['AI뉴스', ...keywords, 'news', today.replace(/\./g, '-')]
        };
    }
}

// 전역 인스턴스
const newsAPI = new NewsAPI();

// UI 업데이트 함수들
async function startNewsCrawl() {
    const keywords = getNewsKeywords();
    const sources = Array.from(document.querySelectorAll('input[name="newsSources"]:checked')).map(cb => cb.value);
    
    if (keywords.length === 0) {
        showToast('키워드를 먼저 추가해주세요', 'error');
        return;
    }
    
    if (sources.length === 0) {
        showToast('뉴스 소스를 선택해주세요', 'error');
        return;
    }
    
    // 로딩 표시
    showLoading('뉴스를 수집하고 있습니다...');
    
    try {
        const result = await newsAPI.crawlNews(keywords, sources);
        
        if (result.status === 'success') {
            // 수집된 뉴스 저장
            saveCollectedNews(result.items);
            
            // 결과 표시
            showToast(`${result.total_items}개의 뉴스를 수집했습니다!`);
            
            // 뉴스 목록 탭으로 이동
            showTab('news-list');
            displayCollectedNews();
            
            // 자동으로 포스트 생성 제안
            if (confirm('수집된 뉴스로 블로그 포스트를 생성하시겠습니까?')) {
                createNewsPost(result.items, keywords);
            }
        } else {
            showToast('뉴스 수집에 실패했습니다', 'error');
        }
    } catch (error) {
        showToast('서버 연결 오류: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 수집된 뉴스 표시
function displayCollectedNews() {
    const newsItems = getCollectedNews();
    const container = document.getElementById('news-list-panel');
    
    if (!container) {
        // news-list 패널 생성
        const panel = document.createElement('div');
        panel.id = 'news-list-panel';
        panel.className = 'content-panel';
        panel.innerHTML = `
            <div class="news-settings">
                <h3>수집된 뉴스</h3>
                <div class="news-actions">
                    <button class="btn btn-primary" onclick="createNewsPost()">
                        <i class="fas fa-edit"></i> 포스트 생성
                    </button>
                    <button class="btn btn-secondary" onclick="clearCollectedNews()">
                        <i class="fas fa-trash"></i> 모두 삭제
                    </button>
                </div>
                <div id="collectedNewsList"></div>
            </div>
        `;
        document.querySelector('.content-area').appendChild(panel);
    }
    
    const listContainer = document.getElementById('collectedNewsList') || container.querySelector('#collectedNewsList');
    
    if (newsItems.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #999;">수집된 뉴스가 없습니다</p>';
        return;
    }
    
    // 최신순으로 정렬
    newsItems.sort((a, b) => new Date(b.collected_at) - new Date(a.collected_at));
    
    listContainer.innerHTML = newsItems.map(item => `
        <div class="news-item" data-id="${item.id}">
            <div class="news-header">
                <h4>${item.title}</h4>
                <span class="news-source">${item.source}</span>
            </div>
            <div class="news-meta">
                <span><i class="fas fa-tag"></i> ${item.keyword}</span>
                <span><i class="fas fa-clock"></i> ${formatDate(item.collected_at)}</span>
                ${item.points ? `<span><i class="fas fa-star"></i> ${item.points}점</span>` : ''}
            </div>
            ${item.summary ? `<p class="news-summary">${item.summary}</p>` : ''}
            <div class="news-actions">
                <a href="${item.link}" target="_blank" class="btn btn-secondary">
                    <i class="fas fa-external-link-alt"></i> 원문 보기
                </a>
                <button class="btn btn-secondary" onclick="removeNewsItem('${item.id}')">
                    <i class="fas fa-times"></i> 삭제
                </button>
            </div>
        </div>
    `).join('');
}

// 뉴스로 포스트 생성
function createNewsPost(items = null, keywords = null) {
    const newsItems = items || getCollectedNews();
    const newsKeywords = keywords || getNewsKeywords();
    
    if (newsItems.length === 0) {
        showToast('수집된 뉴스가 없습니다', 'error');
        return;
    }
    
    const post = newsAPI.formatNewsAsPost(newsItems, newsKeywords);
    
    // 포스트 작성 탭으로 이동하고 내용 채우기
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postTags').value = post.tags.join(', ');
    document.getElementById('postContent').value = post.content;
    
    // AI 뉴스 카테고리 자동 선택
    const categorySelect = document.getElementById('postCategory');
    const aiNewsOption = Array.from(categorySelect.options).find(opt => opt.text === 'AI 뉴스');
    if (aiNewsOption) {
        categorySelect.value = aiNewsOption.value;
    }
    
    showTab('write');
    showToast('뉴스 포스트가 생성되었습니다. 내용을 확인하고 발행해주세요.');
}

// 로컬 스토리지 함수들
function saveCollectedNews(items) {
    const existing = getCollectedNews();
    // 중복 제거하면서 병합
    const merged = [...existing];
    items.forEach(item => {
        if (!merged.find(n => n.id === item.id)) {
            merged.push(item);
        }
    });
    localStorage.setItem('autoblog_collected_news', JSON.stringify(merged));
}

function getCollectedNews() {
    const saved = localStorage.getItem('autoblog_collected_news');
    return saved ? JSON.parse(saved) : [];
}

function removeNewsItem(id) {
    const items = getCollectedNews().filter(item => item.id !== id);
    localStorage.setItem('autoblog_collected_news', JSON.stringify(items));
    displayCollectedNews();
}

function clearCollectedNews() {
    if (confirm('모든 수집된 뉴스를 삭제하시겠습니까?')) {
        localStorage.removeItem('autoblog_collected_news');
        displayCollectedNews();
        showToast('모든 뉴스가 삭제되었습니다');
    }
}

// 로딩 표시
function showLoading(message) {
    const loading = document.createElement('div');
    loading.id = 'loadingOverlay';
    loading.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div style="background: white; padding: 30px; border-radius: 8px; text-align: center;">
                <div class="loading"></div>
                <p style="margin-top: 20px;">${message}</p>
            </div>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.remove();
    }
}

// CSS 추가
const style = document.createElement('style');
style.textContent = `
.news-item {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.news-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 10px;
}

.news-header h4 {
    margin: 0;
    font-size: 16px;
    flex: 1;
}

.news-source {
    background: #3498db;
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
}

.news-meta {
    display: flex;
    gap: 15px;
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 10px;
}

.news-summary {
    font-size: 14px;
    line-height: 1.6;
    color: #555;
    margin: 10px 0;
}

.news-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.news-actions .btn {
    font-size: 13px;
    padding: 6px 12px;
}
`;
document.head.appendChild(style);