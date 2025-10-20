// AI 기능 통합 파일
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Integration loaded');
    
    // 대시보드 업데이트 함수 재정의
    window.updateDashboard = function() {
        const dashboardData = window.dataManager.getDashboardData();
        
        // 대시보드 카드 업데이트
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach(card => {
            const stat = card.dataset.stat;
            const valueElement = card.querySelector('.stat-value');
            const changeElement = card.querySelector('.stat-change');
            
            switch(stat) {
                case 'totalViews':
                    valueElement.textContent = dashboardData.totalViews.toLocaleString();
                    changeElement.textContent = `이번 달 +${Math.floor(Math.random() * 1000)}`;
                    changeElement.className = 'stat-change';
                    break;
                case 'publishedPosts':
                    valueElement.textContent = dashboardData.publishedPosts;
                    changeElement.textContent = `이번 달 +${dashboardData.recentPosts}`;
                    break;
                case 'subscribers':
                    valueElement.textContent = dashboardData.subscribers.toLocaleString();
                    const subChange = Math.floor(Math.random() * 100) - 20;
                    changeElement.textContent = subChange > 0 ? `+${subChange}` : `${subChange}`;
                    changeElement.className = subChange > 0 ? 'stat-change' : 'stat-change down';
                    break;
                case 'engagement':
                    const rate = dashboardData.engagementRate || Math.floor(Math.random() * 30) + 10;
                    valueElement.textContent = `${rate}%`;
                    const engChange = Math.floor(Math.random() * 10) - 3;
                    changeElement.textContent = engChange > 0 ? `+${engChange}%` : `${engChange}%`;
                    changeElement.className = engChange > 0 ? 'stat-change' : 'stat-change down';
                    break;
            }
        });
        
        // 최근 활동 업데이트
        updateRecentActivity(dashboardData.recentActivity);
        
        // 인기 게시글 업데이트
        updatePopularPosts(dashboardData.popularPosts);
        
        // 카테고리 통계 업데이트
        updateCategoryStats(dashboardData.categories);
    };
    
    // 최근 활동 목록 업데이트
    function updateRecentActivity(activities) {
        const listElement = document.getElementById('recentActivityList');
        if (!listElement) return;
        
        if (activities.length === 0) {
            listElement.innerHTML = '<p style="text-align: center; color: #999;">최근 활동이 없습니다.</p>';
            return;
        }
        
        listElement.innerHTML = activities.map(activity => `
            <div style="padding: 10px; border-bottom: 1px solid #eee;">
                <i class="fas ${activity.icon}" style="color: #3498db; margin-right: 10px;"></i>
                <strong>${activity.title}</strong>
                <span style="float: right; color: #999; font-size: 12px;">
                    ${new Date(activity.date).toLocaleDateString('ko-KR')}
                </span>
            </div>
        `).join('');
    }
    
    // 인기 게시글 목록 업데이트
    function updatePopularPosts(posts) {
        const listElement = document.getElementById('popularPostsList');
        if (!listElement) return;
        
        if (posts.length === 0) {
            listElement.innerHTML = '<p style="text-align: center; color: #999;">게시글이 없습니다.</p>';
            return;
        }
        
        listElement.innerHTML = posts.map((post, index) => `
            <div style="padding: 10px; border-bottom: 1px solid #eee;">
                <span style="color: #3498db; font-weight: bold; margin-right: 10px;">#${index + 1}</span>
                <strong>${post.title || '제목 없음'}</strong>
                <span style="float: right; color: #666;">
                    <i class="fas fa-eye"></i> ${post.views || 0}
                </span>
            </div>
        `).join('');
    }
    
    // 카테고리 통계 업데이트
    function updateCategoryStats(categories) {
        const statsElement = document.getElementById('categoryStats');
        if (!statsElement) return;
        
        const posts = window.dataManager.getPosts();
        const categoryStats = {};
        
        categories.forEach(cat => {
            categoryStats[cat] = posts.filter(p => p.category === cat).length;
        });
        
        statsElement.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                ${Object.entries(categoryStats).map(([cat, count]) => `
                    <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #3498db;">${count}</div>
                        <div style="color: #666; margin-top: 5px;">${cat}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // AI 글쓰기 기능
    window.generateWithAI = async function() {
        const topic = document.getElementById('smartPostTitle')?.value;
        if (!topic) {
            showToast('먼저 주제를 입력해주세요!', 'error');
            return;
        }
        
        showToast('AI가 콘텐츠를 생성 중입니다...');
        
        try {
            const content = await window.geminiAPI.generateBlogPost(topic);
            
            // Quill 에디터에 내용 설정
            if (window.smartEditorQuill) {
                window.smartEditorQuill.setText(content);
            } else {
                const contentElement = document.getElementById('smartPostContent');
                if (contentElement) {
                    contentElement.innerHTML = content;
                }
            }
            
            showToast('AI 콘텐츠 생성 완료!', 'success');
        } catch (error) {
            console.error('AI 생성 오류:', error);
            showToast('AI 생성 중 오류가 발생했습니다.', 'error');
        }
    };
    
    // AI 제목 생성
    window.generateTitle = async function() {
        const content = window.smartEditorQuill?.getText() || 
                       document.getElementById('smartPostContent')?.innerText;
        
        if (!content || content.length < 50) {
            showToast('먼저 내용을 작성해주세요 (최소 50자)', 'error');
            return;
        }
        
        showToast('AI가 제목을 생성 중입니다...');
        
        try {
            const titles = await window.geminiAPI.generateTitle(content);
            
            // 팝업으로 제목 선택
            const titleList = titles.split('\n').filter(t => t.trim());
            const selected = prompt('생성된 제목 중 하나를 선택하세요:\n\n' + titleList.join('\n'));
            
            if (selected) {
                const titleInput = document.getElementById('smartPostTitle');
                if (titleInput) {
                    titleInput.value = selected.replace(/^\d+\.\s*/, '');
                }
            }
            
            showToast('제목이 생성되었습니다!', 'success');
        } catch (error) {
            console.error('제목 생성 오류:', error);
            showToast('제목 생성 중 오류가 발생했습니다.', 'error');
        }
    };
    
    // 해시태그 생성
    window.generateHashtags = async function() {
        const content = window.smartEditorQuill?.getText() || 
                       document.getElementById('smartPostContent')?.innerText;
        
        if (!content || content.length < 50) {
            showToast('먼저 내용을 작성해주세요', 'error');
            return;
        }
        
        showToast('해시태그 생성 중...');
        
        try {
            const hashtags = await window.geminiAPI.generateHashtags(content);
            const tagsInput = document.getElementById('smartPostTags');
            if (tagsInput) {
                tagsInput.value = hashtags;
            }
            showToast('해시태그가 생성되었습니다!', 'success');
        } catch (error) {
            console.error('해시태그 생성 오류:', error);
            showToast('해시태그 생성 중 오류가 발생했습니다.', 'error');
        }
    };
    
    // 포스트 저장
    window.saveDraft = function() {
        const title = document.getElementById('smartPostTitle')?.value;
        const content = window.smartEditorQuill?.getText() || 
                       document.getElementById('smartPostContent')?.innerText;
        const category = document.getElementById('smartPostCategory')?.value;
        const tags = document.getElementById('smartPostTags')?.value;
        
        if (!title || !content) {
            showToast('제목과 내용을 입력해주세요', 'error');
            return;
        }
        
        const draft = window.dataManager.saveDraft({
            title,
            content,
            category,
            tags: tags ? tags.split(',').map(t => t.trim()) : []
        });
        
        showToast('임시저장되었습니다!', 'success');
        return draft;
    };
    
    // 포스트 발행
    window.publishPost = function() {
        const title = document.getElementById('smartPostTitle')?.value;
        const content = window.smartEditorQuill?.getText() || 
                       document.getElementById('smartPostContent')?.innerText;
        const category = document.getElementById('smartPostCategory')?.value;
        const tags = document.getElementById('smartPostTags')?.value;
        
        if (!title || !content) {
            showToast('제목과 내용을 입력해주세요', 'error');
            return;
        }
        
        const post = window.dataManager.publishPost({
            title,
            content,
            category,
            tags: tags ? tags.split(',').map(t => t.trim()) : []
        });
        
        showToast('게시글이 발행되었습니다!', 'success');
        
        // 대시보드 업데이트
        setTimeout(() => {
            window.updateDashboard();
        }, 100);
        
        // 입력 필드 초기화
        document.getElementById('smartPostTitle').value = '';
        if (window.smartEditorQuill) {
            window.smartEditorQuill.setText('');
        }
        document.getElementById('smartPostTags').value = '';
        
        return post;
    };
    
    // SEO 체크
    window.checkSEO = async function() {
        const title = document.getElementById('smartPostTitle')?.value;
        const content = window.smartEditorQuill?.getText() || 
                       document.getElementById('smartPostContent')?.innerText;
        
        if (!title || !content) {
            showToast('제목과 내용을 먼저 입력해주세요', 'error');
            return;
        }
        
        showToast('SEO 분석 중...');
        
        const seoScore = {
            titleLength: title.length >= 30 && title.length <= 60,
            contentLength: content.length >= 300,
            hasKeywords: /AI|블로그|콘텐츠/i.test(content),
            hasHeadings: /<h[1-6]>/i.test(content) || /^#+\s/m.test(content)
        };
        
        const totalScore = Object.values(seoScore).filter(Boolean).length * 25;
        
        const feedback = `
SEO 점수: ${totalScore}/100

✓ 제목 길이: ${seoScore.titleLength ? '적절함' : '30-60자 권장'}
✓ 콘텐츠 길이: ${seoScore.contentLength ? '충분함' : '최소 300자 권장'}
✓ 키워드 포함: ${seoScore.hasKeywords ? '포함됨' : '주요 키워드 추가 필요'}
✓ 제목 태그: ${seoScore.hasHeadings ? '사용됨' : 'H1-H6 태그 사용 권장'}
        `;
        
        alert(feedback);
        showToast(`SEO 점수: ${totalScore}/100`, totalScore >= 75 ? 'success' : 'warning');
    };
    
    // AI 뉴스 크롤링
    window.startCrawling = async function() {
        const keywords = document.getElementById('newsKeywords')?.value;
        if (!keywords) {
            showToast('키워드를 입력해주세요', 'error');
            return;
        }
        
        showToast('뉴스를 수집하고 있습니다...');
        
        try {
            // Gemini API를 사용해 관련 뉴스 생성
            const prompt = `${keywords} 관련 최신 뉴스 5개를 다음 형식으로 생성해주세요:
            
1. [제목]
   요약: (2-3문장)
   날짜: YYYY-MM-DD
   
2. [제목]
   ...`;
            
            const newsContent = await window.geminiAPI.generateContent(prompt);
            
            // 파싱하여 뉴스 아이템 생성
            const newsItems = parseNewsContent(newsContent);
            window.dataManager.saveNews(newsItems);
            
            // UI 업데이트
            displayNewsItems(newsItems);
            showToast(`${newsItems.length}개의 뉴스를 수집했습니다!`, 'success');
        } catch (error) {
            console.error('뉴스 수집 오류:', error);
            showToast('뉴스 수집 중 오류가 발생했습니다.', 'error');
        }
    };
    
    function parseNewsContent(content) {
        const lines = content.split('\n');
        const newsItems = [];
        let currentItem = null;
        
        lines.forEach(line => {
            if (/^\d+\.\s+\[/.test(line)) {
                if (currentItem) newsItems.push(currentItem);
                currentItem = {
                    title: line.replace(/^\d+\.\s+\[|\]/g, '').trim(),
                    summary: '',
                    date: new Date().toISOString(),
                    source: 'AI Generated'
                };
            } else if (line.includes('요약:')) {
                if (currentItem) currentItem.summary = line.replace('요약:', '').trim();
            } else if (line.includes('날짜:')) {
                if (currentItem) currentItem.date = line.replace('날짜:', '').trim();
            }
        });
        
        if (currentItem) newsItems.push(currentItem);
        return newsItems;
    }
    
    function displayNewsItems(newsItems) {
        const container = document.getElementById('newsResults');
        if (!container) return;
        
        container.innerHTML = newsItems.map(item => `
            <div style="background: #2c3e50; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                <h4 style="color: #3498db; margin-bottom: 10px;">${item.title}</h4>
                <p style="color: #ecf0f1; margin-bottom: 10px;">${item.summary}</p>
                <div style="color: #95a5a6; font-size: 12px;">
                    <i class="fas fa-calendar"></i> ${item.date} | 
                    <i class="fas fa-globe"></i> ${item.source}
                </div>
            </div>
        `).join('');
    }
    
    // 예약 발행 설정
    window.schedulePost = function() {
        const draft = saveDraft();
        if (!draft) return;
        
        const scheduleDate = document.getElementById('scheduleDate')?.value;
        const scheduleTime = document.getElementById('scheduleTime')?.value;
        
        if (!scheduleDate || !scheduleTime) {
            showToast('날짜와 시간을 선택해주세요', 'error');
            return;
        }
        
        const schedule = window.dataManager.saveSchedule({
            postId: draft.id,
            postTitle: draft.title,
            scheduledAt: `${scheduleDate}T${scheduleTime}`,
            status: 'pending'
        });
        
        showToast(`${scheduleDate} ${scheduleTime}에 발행 예약되었습니다!`, 'success');
    };
    
    // 초기 대시보드 로드
    if (document.getElementById('overview-panel')?.classList.contains('active')) {
        window.updateDashboard();
    }
    
    // 카테고리 목록 로드
    const categorySelects = document.querySelectorAll('#smartPostCategory, #postCategory');
    categorySelects.forEach(select => {
        if (select) {
            const categories = window.dataManager.getCategories();
            select.innerHTML = '<option value="">카테고리 선택</option>' +
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
    });
});

// Toast 알림 함수
function showToast(message, type = 'info') {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // 타입별 배경색 설정
    const colors = {
        success: '#2ecc71',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 애니메이션 스타일 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);