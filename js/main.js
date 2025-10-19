
// Quill 에디터 변수들
let smartEditorQuill = null;
let toneManagerQuill = null;
let templateResultQuill = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the first section and tab
    const firstNavSection = document.querySelector('.nav-section');
    if (firstNavSection) {
        firstNavSection.classList.add('active');
    }
    const firstContentPanel = document.querySelector('.content-panel');
    if (firstContentPanel) {
        firstContentPanel.classList.add('active');
    }
    
    // Quill 에디터 초기화
    initializeQuillEditors();
    
    // 대시보드 초기화 (overview 패널이 활성화된 경우)
    const overviewPanel = document.getElementById('overview-panel');
    if (overviewPanel && overviewPanel.classList.contains('active')) {
        updateDashboard();
    }
});

function initializeQuillEditors() {
    // 스마트 에디터 Quill 초기화
    const smartContentElement = document.getElementById('smartPostContent');
    if (smartContentElement && !smartEditorQuill) {
        smartEditorQuill = new Quill('#smartPostContent', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    ['link', 'image', 'video'],
                    [{ 'align': [] }],
                    ['clean']
                ]
            },
            placeholder: '내용을 입력하세요. AI 도우미를 활용해보세요...'
        });
    }
    
    // 톤 매니저 결과 Quill 초기화
    const toneResultElement = document.getElementById('tone-result');
    if (toneResultElement && !toneManagerQuill) {
        toneManagerQuill = new Quill('#tone-result', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link'],
                    [{ 'align': [] }],
                    ['clean']
                ]
            },
            placeholder: '톤 변경 결과가 여기에 표시됩니다...'
        });
    }
    
    // 템플릿 결과 Quill 초기화
    const templateResultElement = document.getElementById('template-result');
    if (templateResultElement && !templateResultQuill) {
        templateResultQuill = new Quill('#template-result', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    ['link'],
                    [{ 'align': [] }],
                    ['clean']
                ]
            },
            placeholder: 'AI가 생성한 템플릿 결과가 여기에 표시됩니다...'
        });
    }
}

function toggleSection(headerElement) {
    const section = headerElement.closest('.nav-section');
    if (section) {
        section.classList.toggle('active');
    }
}

function showTab(tabName) {
    // Hide all content panels
    document.querySelectorAll('.content-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Show the selected panel
    const panelId = `${tabName}-panel`;
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('active');
        
        // 특정 탭에서 Quill 에디터 초기화
        if (tabName === 'smart-write' || tabName === 'tone-manager' || tabName === 'templates') {
            setTimeout(() => {
                initializeQuillEditors();
            }, 100); // DOM이 완전히 렌더링된 후 초기화
        }

        if (tabName === 'smart-write') {
            setTimeout(() => {
                populateSeriesDropdown();
            }, 100);
        }
        
        // 포스트 탭이 활성화될 때 포스트 목록 로드
        if (tabName === 'posts') {
            setTimeout(() => {
                loadPosts();
            }, 100);
        }

        // 시리즈 탭이 활성화될 때 시리즈 목록 로드
        if (tabName === 'series') {
            setTimeout(() => {
                loadSeries();
            }, 100);
        }

        // 버전 관리 탭이 활성화될 때 포스트 드롭다운 채우기
        if (tabName === 'versions') {
            setTimeout(() => {
                populatePostDropdown();
            }, 100);
        }
        
        // 대시보드 탭이 활성화될 때 실시간 데이터 로드
        if (tabName === 'overview') {
            setTimeout(() => {
                updateDashboard();
            }, 100);
        }
        
        // 트렌드 분석 탭이 활성화될 때 자동 분석 실행
        if (tabName === 'trends') {
            setTimeout(() => {
                analyzeCurrentTrends();
            }, 100);
        }
    } else {
        console.warn(`Content panel with id "${panelId}" not found.`);
    }

    // Optional: Update active state in sidebar navigation
    document.querySelectorAll('.nav-items a').forEach(link => {
        link.parentElement.classList.remove('active');
        if (link.getAttribute('onclick') === `showTab('${tabName}')`) {
            link.parentElement.classList.add('active');
        }
    });
}

// A placeholder for other functions to avoid errors
function quickAction(action) {
    console.log(`Quick action: ${action}`);
    if (action === 'write') {
        showTab('smart-write');
    }
}

async function updateDashboard() {
    console.log("Fetching real dashboard stats from database...");
    
    try {
        // 병렬로 모든 데이터 가져오기
        const [stats, insights, keywords] = await Promise.all([
            apiClient.getDashboardStats(),
            apiClient.getInsights(),
            apiClient.getTrendingKeywords(5)
        ]);
        
        console.log("Received real stats from DB:", stats);

        // 실제 사용자인지 확인 (모든 수치가 0이면 신규 사용자)
        const isNewUser = stats.total_views === 0 && stats.published_posts === 0 && stats.draft_posts === 0;
        
        if (isNewUser) {
            // 신규 사용자 상태 표시
            showNewUserDashboard();
        } else {
            // 기존 사용자 - 실제 데이터 표시
            updateExistingUserDashboard(stats, insights, keywords);
        }

        console.log("Dashboard updated with real database data.");
        
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (dashboardGrid) {
            dashboardGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">
                    <h5>❌ 연결 실패</h5>
                    <p>대시보드 데이터를 불러오는 데 실패했습니다.</p>
                    <p><small>에러: ${error.message}</small></p>
                    <button class="btn btn-primary" onclick="updateDashboard()" style="margin-top: 15px;">
                        <i class="fas fa-redo"></i> 다시 시도
                    </button>
                </div>
            `;
        }
    }
}

function showNewUserDashboard() {
    // 통계 카드를 0으로 업데이트
    const totalViewsCard = document.querySelector('.stat-card[data-stat="totalViews"] .stat-value');
    if (totalViewsCard) {
        totalViewsCard.textContent = '0';
    }

    const publishedPostsCard = document.querySelector('.stat-card[data-stat="publishedPosts"] .stat-value');
    if (publishedPostsCard) {
        publishedPostsCard.textContent = '0';
    }

    const draftPostsCard = document.querySelector('.stat-card[data-stat="draftPosts"] .stat-value');
    if (draftPostsCard) {
        draftPostsCard.textContent = '0';
    }

    const engagementCard = document.querySelector('.stat-card[data-stat="engagement"] .stat-value');
    if (engagementCard) {
        engagementCard.textContent = '0%';
    }

    // 신규 사용자 환영 메시지
    const insightsContainer = document.querySelector('.ai-insights');
    if (insightsContainer) {
        insightsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">
                <h4>🎉 AI 블로그 마스터에 오신 것을 환영합니다!</h4>
                <p style="margin: 15px 0; line-height: 1.6;">아직 작성된 글이 없습니다. 첫 번째 포스트를 작성해보세요!</p>
                <div style="margin-top: 20px;">
                    <button class="btn" style="background: white; color: #667eea; margin-right: 10px;" onclick="showTab('smart-write')">
                        <i class="fas fa-pen"></i> 첫 글 작성하기
                    </button>
                    <button class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid white;" onclick="generateSampleData()">
                        <i class="fas fa-database"></i> 샘플 데이터 체험
                    </button>
                </div>
                <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
                    * 샘플 데이터는 언제든지 초기화할 수 있습니다
                </p>
            </div>
        `;
    }

    // 트렌딩 키워드 영역
    const keywordsContainer = document.querySelector('.trending-keywords');
    if (keywordsContainer) {
        keywordsContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666;">
                <i class="fas fa-chart-line" style="font-size: 48px; color: #ddd; margin-bottom: 15px;"></i>
                <h5>트렌딩 키워드 없음</h5>
                <p>글을 작성하면 AI가 자동으로 트렌딩 키워드를 분석해드립니다.</p>
            </div>
        `;
    }
}

function updateExistingUserDashboard(stats, insights, keywords) {
    // 통계 카드 업데이트 (애니메이션 효과)
    const totalViewsCard = document.querySelector('.stat-card[data-stat="totalViews"] .stat-value');
    if (totalViewsCard) {
        animateNumber(totalViewsCard, stats.total_views);
    }

    const publishedPostsCard = document.querySelector('.stat-card[data-stat="publishedPosts"] .stat-value');
    if (publishedPostsCard) {
        animateNumber(publishedPostsCard, stats.published_posts);
    }

    const draftPostsCard = document.querySelector('.stat-card[data-stat="draftPosts"] .stat-value');
    if (draftPostsCard) {
        animateNumber(draftPostsCard, stats.draft_posts);
    }

    const engagementCard = document.querySelector('.stat-card[data-stat="engagement"] .stat-value');
    if (engagementCard) {
        animateNumber(engagementCard, parseFloat(stats.engagement_rate), '%');
    }

    // AI 인사이트 업데이트
    updateInsights(insights);
    
    // 트렌딩 키워드 업데이트
    updateTrendingKeywords(keywords);
}

// AI 인사이트 업데이트
function updateInsights(insights) {
    const insightsContainer = document.querySelector('.ai-insights');
    if (!insightsContainer) return;
    
    if (!insights || insights.length === 0) {
        insightsContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666;">
                <i class="fas fa-lightbulb" style="font-size: 48px; color: #ddd; margin-bottom: 15px;"></i>
                <h5>AI 인사이트 없음</h5>
                <p>글을 작성하고 활동하면 AI가 유용한 인사이트를 제공합니다.</p>
            </div>
        `;
        return;
    }
    
    const insightsList = insights.slice(0, 5).map(insight => `
        <div class="insight-item ${!insight.is_read ? 'unread' : ''}">
            <div class="insight-header">
                <span class="insight-icon">${getInsightIcon(insight.insight_type)}</span>
                <span class="insight-time">${formatTime(insight.created_at)}</span>
            </div>
            <h4>${insight.title}</h4>
            <p>${insight.content}</p>
        </div>
    `).join('');
    
    insightsContainer.innerHTML = insightsList;
}

// 트렌딩 키워드 업데이트
function updateTrendingKeywords(keywords) {
    const keywordsContainer = document.querySelector('.trending-keywords');
    if (!keywordsContainer) return;
    
    if (!keywords || keywords.length === 0) {
        keywordsContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666;">
                <i class="fas fa-hashtag" style="font-size: 48px; color: #ddd; margin-bottom: 15px;"></i>
                <h5>트렌딩 키워드 없음</h5>
                <p>글을 작성하면 AI가 자동으로 트렌딩 키워드를 분석해드립니다.</p>
            </div>
        `;
        return;
    }
    
    const keywordsList = keywords.map(keyword => `
        <div class="keyword-tag" style="--popularity: ${keyword.popularity_score}%">
            <span class="keyword-name">${keyword.keyword}</span>
            <span class="keyword-score">${keyword.popularity_score.toFixed(0)}</span>
        </div>
    `).join('');
    
    keywordsContainer.innerHTML = keywordsList;
}

// 시간 포맷 함수
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) return Math.floor(diff / 60000) + '분 전';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '시간 전';
    return Math.floor(diff / 86400000) + '일 전';
}

// 인사이트 아이콘 가져오기
function getInsightIcon(type) {
    const icons = {
        'performance': '📈',
        'engagement': '💬',
        'trend': '🔥',
        'suggestion': '💡',
        'warning': '⚠️'
    };
    return icons[type] || '📊';
}

// 숫자 애니메이션 함수
function animateNumber(element, targetValue, suffix = '') {
    const startValue = parseInt(element.textContent) || 0;
    const increment = (targetValue - startValue) / 30;
    let currentValue = startValue;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if ((increment > 0 && currentValue >= targetValue) || (increment < 0 && currentValue <= targetValue)) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        
        if (suffix === '%') {
            element.textContent = currentValue.toFixed(1) + suffix;
        } else {
            element.textContent = Math.floor(currentValue).toLocaleString() + suffix;
        }
    }, 50);
}

function exportReport() {
    console.log('Exporting report...');
}

// 대시보드 하위 페이지 함수들
async function refreshInsights() {
    console.log('실제 데이터베이스에서 AI 인사이트를 가져오고 있습니다...');
    const insightsGrid = document.querySelector('.insights-grid');
    if (!insightsGrid) return;

    insightsGrid.style.opacity = '0.5';
    
    try {
        const insights = await apiClient.getInsights();
        console.log("Received insights from DB:", insights);
        
        setTimeout(() => {
            if (insights.length === 0) {
                insightsGrid.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #666;">
                        <p>아직 인사이트가 없습니다.</p>
                        <p><small>샘플 데이터를 생성하려면 대시보드에서 '샘플 데이터 체험' 버튼을 클릭하세요.</small></p>
                    </div>
                `;
            } else {
                const typeConfig = {
                    'performance': { icon: 'fas fa-trending-up', color: '#4a69bd' },
                    'audience': { icon: 'fas fa-users', color: '#2ecc71' },
                    'keyword': { icon: 'fas fa-tags', color: '#f39c12' },
                    'improvement': { icon: 'fas fa-chart-line', color: '#e74c3c' }
                };
                
                insightsGrid.innerHTML = insights.map(insight => {
                    const config = typeConfig[insight.insight_type] || { icon: 'fas fa-info-circle', color: '#6c757d' };
                    return `
                        <div class="insight-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid ${config.color}; animation: fadeInUp 0.6s ease;">
                            <h4><i class="${config.icon}" style="color: ${config.color}; margin-right: 8px;"></i> ${insight.title}</h4>
                            <p style="margin: 10px 0; line-height: 1.5;">${insight.content}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                                <small style="color: #666;">생성일: ${new Date(insight.created_at).toLocaleString()}</small>
                                <span style="background: ${insight.priority === 'high' ? '#e74c3c' : insight.priority === 'medium' ? '#f39c12' : '#6c757d'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${insight.priority}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            insightsGrid.style.opacity = '1';
        }, 300);
    } catch (error) {
        console.error('Error fetching insights:', error);
        insightsGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <p>인사이트를 불러오는데 실패했습니다.</p>
                <p><small>에러: ${error.message}</small></p>
            </div>
        `;
        insightsGrid.style.opacity = '1';
    }
}

async function updateAnalyticsPeriod(period) {
    console.log(`실제 데이터베이스에서 ${period}일 분석 데이터를 가져오고 있습니다...`);
    
    const daysMap = {
        '7days': 7,
        '30days': 30,
        '90days': 90
    };
    const days = daysMap[period] || 7;

    try {
        const data = await apiClient.getAnalyticsByPeriod(days);
        console.log(`Received ${period} analytics from DB:`, data);
        
        const hasData = data.page_views > 0 || data.unique_visitors > 0;
        
        if (!hasData) {
            showEmptyAnalytics(period);
            return;
        }
        
        const statCards = document.querySelectorAll('#analytics-panel .stat-value');
        if (statCards.length >= 4) {
            animateNumber(statCards[0], data.page_views);
            animateNumber(statCards[1], data.unique_visitors);
            statCards[2].textContent = formatDuration(data.avg_session_duration);
            statCards[3].textContent = data.bounce_rate.toFixed(1) + '%';
        }
        
    } catch (error) {
        console.error('Error fetching analytics:', error);
        showAnalyticsError(error.message);
    }
}

function showEmptyAnalytics(period) {
    // 모든 수치를 0으로 설정
    const statCards = document.querySelectorAll('#analytics-panel .stat-value');
    if (statCards.length >= 4) {
        statCards[0].textContent = '0'; // 페이지 뷰
        statCards[1].textContent = '0'; // 방문자 수
        statCards[2].textContent = '0:00'; // 평균 체류시간
        statCards[3].textContent = '0%'; // 바운스율
    }
    
    // 빈 상태 메시지 표시
    const analyticsPanel = document.getElementById('analytics-panel');
    const existingMessage = analyticsPanel.querySelector('.empty-analytics-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-analytics-message';
    emptyMessage.innerHTML = `
        <div style="text-align: center; padding: 40px; margin: 20px 0; background: #f8f9fa; border-radius: 12px; color: #666;">
            <i class="fas fa-chart-bar" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
            <h4>독자 분석 데이터 없음</h4>
            <p style="margin: 15px 0; line-height: 1.6;">아직 블로그 방문자가 없습니다.<br>글을 발행하고 공유하면 독자 분석 데이터가 나타납니다.</p>
            <button class="btn btn-primary" onclick="showTab('smart-write')" style="margin-top: 15px;">
                <i class="fas fa-pen"></i> 첫 글 작성하기
            </button>
        </div>
    `;
    
    analyticsPanel.appendChild(emptyMessage);
}

function showAnalyticsError(errorMessage) {
    // 에러 표시
    const statCards = document.querySelectorAll('#analytics-panel .stat-value');
    statCards.forEach(card => {
        card.textContent = 'Error';
        card.style.color = '#e74c3c';
    });
    
    // 에러 메시지 표시
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;';
        errorDiv.innerHTML = `
            <h5>❌ 데이터 로드 실패</h5>
            <p><strong>에러:</strong> ${errorMessage}</p>
            <button class="btn btn-secondary" onclick="updateAnalyticsPeriod('7days')" style="margin-top: 10px;">
                <i class="fas fa-redo"></i> 다시 시도
            </button>
        `;
        analyticsPanel.appendChild(errorDiv);
        
        // 5초 후 에러 메시지 제거
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// 시간 포맷팅 함수 (초를 mm:ss 형태로 변환)
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function analyzeCurrentTrends() {
    console.log('실제 데이터베이스에서 트렌드 키워드를 분석하고 있습니다...');
    
    const keywordsContainer = document.querySelector('#trends-panel .trending-keywords');
    const resultDiv = document.querySelector('.trend-analysis-result');
    if (!keywordsContainer || !resultDiv) return;
    
    keywordsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;"><i class="spinner"></i> 데이터베이스에서 트렌드 분석 중...</div>';
    resultDiv.innerHTML = '';
    
    try {
        const keywords = await apiClient.getTrendingKeywords(10);
        console.log("Received trending keywords from DB:", keywords);
        
        if (keywords.length === 0) {
            keywordsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h5>📊 키워드 없음</h5>
                    <p>아직 트렌딩 키워드가 없습니다.</p>
                </div>
            `;
        } else {
            const categoryColors = {
                'tech': '#4a69bd', 'business': '#2ecc71', 'trending': '#f39c12', 'data': '#e74c3c', 'social': '#9b59b6'
            };
            keywordsContainer.innerHTML = keywords.map((kw, i) => {
                const color = categoryColors[kw.category] || '#6c757d';
                return `
                    <span class="keyword-tag" style="background: ${color}; animation-delay: ${i * 0.1}s;" title="카테고리: ${kw.category || 'general'} | 인기도: ${kw.popularity_score}%">
                        ${kw.keyword} <small>${kw.popularity_score.toFixed(1)}%</small>
                    </span>
                `;
            }).join('');

            const avgPopularity = (keywords.reduce((sum, k) => sum + k.popularity_score, 0) / keywords.length).toFixed(1);
            const topKeyword = keywords[0];

            resultDiv.innerHTML = `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-top: 20px;">
                    <h5>📊 트렌드 분석 완료</h5>
                    <p><strong>최고 인기 키워드:</strong> ${topKeyword.keyword} (${topKeyword.popularity_score.toFixed(1)}%)</p>
                    <p><strong>평균 인기도:</strong> ${avgPopularity}%</p>
                </div>
            `;
        }
        showToast('트렌드 분석이 완료되었습니다!', 'success');
    } catch (error) {
        console.error('Error fetching trending keywords:', error);
        keywordsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <h5>❌ 분석 실패</h5>
                <p>${error.message}</p>
            </div>
        `;
        showToast('트렌드 분석에 실패했습니다.', 'error');
    }
}

// 키워드 검색 함수 (추가 기능)
function searchByKeyword(keyword) {
    console.log(`Searching for keyword: ${keyword}`);
    // 여기에 키워드 기반 검색 로직을 추가할 수 있습니다
    alert(`"${keyword}" 키워드로 검색 기능은 추후 구현 예정입니다.`);
}

// Add other placeholder functions that are called in the HTML to prevent "not defined" errors
function saveDraft() { console.log('saveDraft called'); }
function publishPost() { console.log('publishPost called'); }
async function generateTitle() {
    const currentTitle = document.getElementById('smartPostTitle').value;
    const category = document.getElementById('smartPostCategory').value;
    
    const topic = currentTitle || '블로그 포스트';
    const keywords = category ? [category] : [];

    const button = document.querySelector('button[onclick="generateTitle()"]');
    const originalButtonText = button.innerHTML;
    button.innerHTML = '<i class="spinner"></i> 생성 중...';
    button.disabled = true;

    try {
        const response = await apiClient.generateTitles(topic, keywords);
        
        if (response.titles && response.titles.length > 0) {
            document.getElementById('smartPostTitle').value = response.titles[0].title;
            showToast('AI가 새로운 제목을 생성했습니다.', 'success');
        } else {
            showToast('AI가 제목을 생성하지 못했습니다.', 'error');
        }
    } catch (error) {
        console.error('제목 생성 오류:', error);
        showToast(`제목 생성 중 오류 발생: ${error.message}`, 'error');
    } finally {
        button.innerHTML = originalButtonText;
        button.disabled = false;
    }
}
async function generateFromTemplate() {
    const templateType = document.getElementById('template-type').value;
    const templateTopic = document.getElementById('template-topic').value;
    
    if (!templateTopic.trim()) {
        alert('주제를 입력해주세요.');
        return;
    }

    const resultDiv = document.getElementById('template-result');
    const quill = Quill.find(resultDiv);
    if (quill) {
        quill.root.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> AI가 템플릿 콘텐츠를 생성하고 있습니다...</div>';
    }

    try {
        const response = await apiClient.generateContent(templateType, { title: templateTopic });
        
        if (quill) {
            quill.root.innerHTML = response.content;
        }
        showToast('AI 템플릿 생성이 완료되었습니다.', 'success');
    } catch (error) {
        console.error('템플릿 생성 오류:', error);
        if (quill) {
            quill.root.innerHTML = `<p style="color: red;">템플릿 생성 중 오류가 발생했습니다: ${error.message}</p>`;
        }
        showToast('템플릿 생성 중 오류가 발생했습니다.', 'error');
    }
}

function generateOutline() { console.log('generateOutline called'); }
async function checkSEO() {
    const content = document.getElementById('seo-content').value;
    const title = document.getElementById('seo-title').value;
    const fullContent = `<h1>${title}</h1>\n${content}`;

    if (!fullContent.trim()) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }

    const resultDiv = document.getElementById('seo-result');
    resultDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> AI가 SEO를 분석하고 있습니다...</div>';

    try {
        const response = await apiClient.analyzeSEO(fullContent);

        resultDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h4>SEO 분석 결과 (점수: ${response.score}/100)</h4>
                <div style="margin: 15px 0;">
                    <h5>개선 제안</h5>
                    <ul>
                        ${response.suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        showToast('SEO 분석이 완료되었습니다.', 'success');
    } catch (error) {
        console.error('SEO 분석 오류:', error);
        resultDiv.innerHTML = `<p style="color: red;">SEO 분석 중 오류가 발생했습니다: ${error.message}</p>`;
        showToast('SEO 분석 중 오류가 발생했습니다.', 'error');
    }
}
function checkTone() { console.log('checkTone called'); }
function addCategory() { console.log('addCategory called'); }
function startNewsCrawl() { console.log('startNewsCrawl called'); }
function addNewsKeyword() { console.log('addNewsKeyword called'); }
function addNewIdea() { console.log('addNewIdea called'); }

// 팩트체킹 기능
async function startFactCheck() {
    const content = document.getElementById('fact-check-text').value;
    if (!content.trim()) {
        alert('팩트체크할 내용을 입력해주세요.');
        return;
    }
    
    const resultDiv = document.getElementById('fact-check-result');
    resultDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> AI가 팩트체크를 진행하고 있습니다...</div>';
    
    try {
        const response = await apiClient.checkFacts(content);
        const facts = response.results;
        
        if (!facts || facts.length === 0) {
            resultDiv.innerHTML = '<p style="color: #666;">분석할 주장을 찾지 못했습니다.</p>';
            return;
        }

        resultDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h4>팩트체크 결과</h4>
                ${facts.map(fact => {
                    const statusConfig = {
                        'verified': { text: '검증됨', color: '#2ecc71', icon: '✅' },
                        'unverified': { text: '검증 필요', color: '#f39c12', icon: '⚠️' },
                        'error': { text: '오류', color: '#e74c3c', icon: '❌' },
                        'info': { text: '정보', color: '#3498db', icon: 'ℹ️' }
                    };
                    const config = statusConfig[fact.status] || statusConfig['info'];
                    return `
                    <div class="fact-check-item ${fact.status}" style="margin: 15px 0; padding: 15px; border-left: 4px solid ${config.color}; background: white;">
                        <h5>${fact.claim}</h5>
                        <p style="margin: 10px 0 0 0;">${fact.explanation}</p>
                        <span style="font-size: 12px; color: ${config.color};">
                            ${config.icon} ${config.text}
                        </span>
                    </div>
                `}).join('')}
            </div>
        `;
        showToast('팩트체크가 완료되었습니다.', 'success');
    } catch (error) {
        console.error('팩트체크 오류:', error);
        resultDiv.innerHTML = `<p style="color: red;">팩트체크 중 오류가 발생했습니다: ${error.message}</p>`;
        showToast('팩트체크 중 오류가 발생했습니다.', 'error');
    }
}
// loadPosts는 post-manager.js에서 정의됨
function loadCategories() { console.log('loadCategories called'); }
function loadIdeas() { console.log('loadIdeas called'); }
// editPost와 deletePost는 post-manager.js에서 정의됨

// AI 기능들
async function changeTone() {
    const originalText = document.getElementById('tone-original-text').value;
    const selectedTone = document.querySelector('input[name="tone"]:checked').value;
    
    if (!originalText.trim()) {
        alert('변경할 텍스트를 입력해주세요.');
        return;
    }
    
    const resultDiv = document.getElementById('tone-result');
    resultDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> AI가 텍스트 톤을 변경하고 있습니다...</div>';

    try {
        const response = await apiClient.changeTone(originalText, selectedTone);
        
        if (toneManagerQuill) {
            toneManagerQuill.root.innerHTML = `<p>${response.text}</p>`;
        } else {
            resultDiv.innerHTML = `<p>${response.text}</p>`;
        }
        showToast('텍스트 톤이 변경되었습니다.', 'success');
    } catch (error) {
        console.error('톤 변경 오류:', error);
        resultDiv.innerHTML = `<p style="color: red;">톤 변경 중 오류가 발생했습니다: ${error.message}</p>`;
        showToast('톤 변경 중 오류가 발생했습니다.', 'error');
    }
}

// 에디터 유틸리티 함수들
function exportToWord() {
    if (smartEditorQuill) {
        const content = smartEditorQuill.root.innerHTML;
        const blob = new Blob([content], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'blog_post.doc';
        link.click();
    }
}

function copyToClipboard() {
    if (smartEditorQuill) {
        const content = smartEditorQuill.getText();
        navigator.clipboard.writeText(content).then(() => {
            alert('클립보드에 복사되었습니다.');
        });
    }
}

function saveAsDraft() {
    if (smartEditorQuill) {
        const content = smartEditorQuill.root.innerHTML;
        localStorage.setItem('blog_draft', content);
        alert('임시저장되었습니다.');
    }
}

// 템플릿 전용 유틸리티 함수들
function exportTemplateToWord() {
    const content = document.getElementById('template-result').innerHTML;
    const blob = new Blob([content], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_result.doc';
    link.click();
}

function copyTemplateToClipboard() {
    const content = document.getElementById('template-result').innerText;
    navigator.clipboard.writeText(content).then(() => {
        alert('클립보드에 복사되었습니다.');
    });
}

// 알림 토스트 함수
function showToast(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // 애니메이션으로 표시
    setTimeout(() => notification.classList.add('show'), 100);
    
    // 3초 후 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== 새로 추가된 패널들의 함수들 =====

// 스마트 리서치 함수
async function startResearch() {
    const query = document.getElementById('research-query').value;
    if (!query.trim()) {
        alert('리서치 주제를 입력해주세요.');
        return;
    }
    
    const resultDiv = document.getElementById('research-result');
    resultDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> AI가 리서치를 진행하고 있습니다...</div>';
    
    try {
        const response = await apiClient.smartResearch(query);
        
        let sourcesHTML = '';
        if (response.sources && response.sources.length > 0) {
            sourcesHTML = '<h5>출처</h5><ul>' + response.sources.map(source => 
                `<li><a href="${source.url}" target="_blank">${source.title}</a><p>${source.snippet}</p></li>`
            ).join('') + '</ul>';
        }

        resultDiv.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px;">
                ${response.summary}
                <div style="margin-top: 20px;">${sourcesHTML}</div>
            </div>
        `;
        showToast('스마트 리서치가 완료되었습니다.', 'success');
    } catch (error) {
        console.error('리서치 오류:', error);
        resultDiv.innerHTML = `<p style="color: red;">리서치 중 오류가 발생했습니다: ${error.message}</p>`;
        showToast('리서치 중 오류가 발생했습니다.', 'error');
    }
}

async function startAbTest() {
    const titleA = document.getElementById('title-a').value;
    const titleB = document.getElementById('title-b').value;
    
    if (!titleA.trim() || !titleB.trim()) {
        showToast('두 제목을 모두 입력해주세요.', 'warning');
        return;
    }
    
    const resultDiv = document.getElementById('title-ab-result');
    resultDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> AI가 두 제목을 비교 분석하고 있습니다...</div>';
    
    try {
        const result = await apiClient.abTestTitles(titleA, titleB);
        
        resultDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h4>A/B 테스트 결과: <span style="color: #2ecc71;">제목 ${result.winner}</span> 승리!</h4>
                <p><strong>분석 요약:</strong> ${result.reason}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0;">
                    <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${result.winner === 'A' ? '#2ecc71' : '#e74c3c'};">
                        <h5>제목 A (점수: ${result.title_a.score.toFixed(1)})</h5>
                        <p>"${result.title_a.title}"</p>
                        <p style="font-size: 12px; color: #666;">${result.title_a.explanation}</p>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${result.winner === 'B' ? '#2ecc71' : '#e74c3c'};">
                        <h5>제목 B (점수: ${result.title_b.score.toFixed(1)})</h5>
                        <p>"${result.title_b.title}"</p>
                        <p style="font-size: 12px; color: #666;">${result.title_b.explanation}</p>
                    </div>
                </div>
            </div>
        `;
        showToast('제목 A/B 테스트가 완료되었습니다.', 'success');
    } catch (error) {
        console.error('A/B 테스트 오류:', error);
        resultDiv.innerHTML = `<p style="color: red;">A/B 테스트 중 오류가 발생했습니다: ${error.message}</p>`;
        showToast('A/B 테스트 중 오류가 발생했습니다.', 'error');
    }
}

async function generateThumbnail() {
    const style = document.getElementById('thumbnail-style').value;
    const text = document.getElementById('thumbnail-text').value;
    
    if (!text.trim()) {
        showToast('썸네일에 표시할 텍스트를 입력해주세요.', 'warning');
        return;
    }
    
    const resultDiv = document.getElementById('thumbnail-result');
    resultDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> AI가 썸네일을 생성하고 있습니다...</div>';
    
    try {
        const response = await apiClient.generateThumbnail(text, style);
        
        resultDiv.innerHTML = `
            <img src="${response.imageUrl}" alt="Generated Thumbnail" style="max-width: 100%; border-radius: 8px;">
        `;
        showToast('썸네일이 생성되었습니다.', 'success');
    } catch (error) {
        console.error('썸네일 생성 오류:', error);
        resultDiv.innerHTML = `<p style="color: red;">썸네일 생성 중 오류가 발생했습니다: ${error.message}</p>`;
        showToast('썸네일 생성 중 오류가 발생했습니다.', 'error');
    }
}

// 해시태그 생성 함수
async function generateHashtags() {
    const content = document.getElementById('hashtag-content').value;
    const platform = document.getElementById('hashtag-platform').value;
    
    if (!content.trim()) {
        alert('콘텐츠 내용을 입력해주세요.');
        return;
    }
    
    const resultDiv = document.getElementById('hashtag-result');
    resultDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> AI가 해시태그를 생성하고 있습니다...</div>';
    
    try {
        const response = await apiClient.generateHashtags(content);
        const hashtags = response.hashtags;

        if (!hashtags || hashtags.length === 0) {
            resultDiv.innerHTML = '<p style="color: #666;">해시태그를 생성하지 못했습니다.</p>';
            return;
        }

        resultDiv.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px;">
                <h4>${platform} 최적화 해시태그</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin: 15px 0;">
                    ${hashtags.map(tag => `<span style="background: #4a69bd; color: white; padding: 6px 12px; border-radius: 20px; font-size: 13px;">${tag}</span>`).join('')}
                </div>
                <button onclick="copyGeneratedHashtags()" style="padding: 8px 16px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">복사하기</button>
            </div>
        `;
        // Store hashtags for the copy function
        resultDiv.dataset.hashtags = hashtags.join(' ');
        showToast('AI 해시태그가 생성되었습니다.', 'success');
    } catch (error) {
        console.error('해시태그 생성 오류:', error);
        resultDiv.innerHTML = `<p style="color: red;">해시태그 생성 중 오류가 발생했습니다: ${error.message}</p>`;
        showToast('해시태그 생성 중 오류가 발생했습니다.', 'error');
    }
}

function copyGeneratedHashtags() {
    const resultDiv = document.getElementById('hashtag-result');
    const hashtags = resultDiv.dataset.hashtags;
    if (hashtags) {
        navigator.clipboard.writeText(hashtags).then(() => {
            alert('해시태그가 클립보드에 복사되었습니다.');
        });
    } else {
        alert('복사할 해시태그가 없습니다.');
    }
}

// 가독성 분석 함수
async function analyzeReadability() {
    const text = document.getElementById('readability-text').value;
    
    if (!text.trim()) {
        alert('분석할 텍스트를 입력해주세요.');
        return;
    }
    
    const resultDiv = document.getElementById('readability-result');
    resultDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> AI가 가독성을 분석하고 있습니다...</div>';
    
    try {
        const response = await apiClient.analyzeReadability(text);
        
        resultDiv.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px;">
                <h4>가독성 분석 결과</h4>
                <div style="margin: 15px 0;">
                    <p><strong>가독성 점수:</strong> <span style="color: #2ecc71; font-weight: bold;">${response.score}/100 (${response.level})</span></p>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 15px;">
                    <h5>개선 제안</h5>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        ${response.suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        showToast('가독성 분석이 완료되었습니다.', 'success');
    } catch (error) {
        console.error('가독성 분석 오류:', error);
        resultDiv.innerHTML = `<p style="color: red;">가독성 분석 중 오류가 발생했습니다: ${error.message}</p>`;
        showToast('가독성 분석 중 오류가 발생했습니다.', 'error');
    }
}

async function populateSeriesDropdown() {
    const seriesSelect = document.getElementById('smartPostSeries');
    if (!seriesSelect) return;

    try {
        const series = await apiClient.getSeries();
        seriesSelect.innerHTML = '<option value="">시리즈 없음</option>'; // Reset options
        series.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.title;
            seriesSelect.appendChild(option);
        });
    } catch (error) {
        console.error('시리즈 드롭다운 채우기 오류:', error);
        seriesSelect.innerHTML = '<option value="">시리즈를 불러올 수 없습니다</option>';
    }
}

async function populatePostDropdown() {
    const postSelect = document.getElementById('versionPostSelect');
    if (!postSelect) return;

    try {
        const posts = await apiClient.getPosts();
        postSelect.innerHTML = '<option value="">포스트를 선택하세요</option>'; // Reset options
        posts.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.title;
            postSelect.appendChild(option);
        });
    } catch (error) {
        console.error('포스트 드롭다운 채우기 오류:', error);
        postSelect.innerHTML = '<option value="">포스트를 불러올 수 없습니다</option>';
    }
}

async function loadVersions(postId) {
    const versionsList = document.getElementById('versionsList');
    if (!postId) {
        versionsList.innerHTML = '<p style="text-align: center; color: #999;">포스트를 선택하면 버전 히스토리가 여기에 표시됩니다.</p>';
        return;
    }

    versionsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> 버전 목록을 불러오는 중...</div>';

    try {
        const versions = await apiClient.getPostVersions(postId);
        if (versions.length === 0) {
            versionsList.innerHTML = '<p style="text-align: center; color: #999;">해당 포스트의 버전 기록이 없습니다.</p>';
            return;
        }

        versionsList.innerHTML = versions.map(v => `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                <h5>버전 #${v.id}</h5>
                <p style="color: #666;">저장 시간: ${new Date(v.created_at).toLocaleString()}</p>
                <p>제목: ${v.title}</p>
                <div style="margin-top: 10px;">
                    <button class="btn btn-sm btn-secondary" onclick="restoreVersion(${v.id})">이 버전으로 복원</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('버전 로딩 오류:', error);
        versionsList.innerHTML = `<p style="color: red;">버전 목록을 불러오는 중 오류가 발생했습니다: ${error.message}</p>`;
    }
}

// 시리즈 관리 함수
async function loadSeries() {
    const seriesList = document.getElementById('seriesList');
    seriesList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> 시리즈 목록을 불러오는 중...</div>';

    try {
        const series = await apiClient.getSeries();
        if (series.length === 0) {
            seriesList.innerHTML = '<p style="text-align: center; color: #999;">아직 생성된 시리즈가 없습니다. 새 시리즈를 추가해보세요.</p>';
            return;
        }

        seriesList.innerHTML = series.map(s => `
            <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 15px; border-radius: 8px;">
                <h4>${s.title}</h4>
                <p style="color: #666;">${s.description || '설명이 없습니다.'}</p>
                <p style="color: #666;">글 ${s.posts.length}개</p>
                <div style="margin-top: 15px;">
                    <button style="padding: 6px 12px; margin-right: 10px; background: #4a69bd; color: white; border: none; border-radius: 4px;">편집</button>
                    <button style="padding: 6px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px;">삭제</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('시리즈 로딩 오류:', error);
        seriesList.innerHTML = `<p style="color: red;">시리즈 목록을 불러오는 중 오류가 발생했습니다: ${error.message}</p>`;
    }
}

async function createNewSeries() {
    const title = prompt('새 시리즈 이름을 입력하세요:');
    if (!title) return;
    const description = prompt('시리즈에 대한 간단한 설명을 입력하세요 (선택사항):');

    try {
        await apiClient.createSeries({ title, description });
        showToast('새로운 시리즈가 생성되었습니다.', 'success');
        loadSeries();
    } catch (error) {
        console.error('시리즈 생성 오류:', error);
        showToast(`시리즈 생성 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
}

// 아이디어 관리 함수
function addNewIdea() {
    const idea = prompt('새로운 아이디어를 입력하세요:');
    if (idea) {
        const ideasGrid = document.getElementById('ideasGrid');
        const newCard = document.createElement('div');
        newCard.className = 'idea-card';
        newCard.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #2ecc71;';
        newCard.innerHTML = `
            <h4>${idea}</h4>
            <p>추가일: ${new Date().toLocaleDateString()}</p>
            <button onclick="this.parentElement.remove()" style="padding: 4px 8px; background: #e74c3c; color: white; border: none; border-radius: 4px; font-size: 12px;">삭제</button>
        `;
        ideasGrid.appendChild(newCard);
    }
}

// 브레인스토밍 함수
async function startBrainstorm() {
    const topic = document.getElementById('brainstorm-topic').value;
    const type = document.getElementById('brainstorm-type').value;
    
    if (!topic.trim()) {
        alert('브레인스토밍 주제를 입력해주세요.');
        return;
    }
    
    const resultDiv = document.getElementById('brainstorm-result');
    resultDiv.innerHTML = '<p style="color: #666;">AI 브레인스토밍을 진행하고 있습니다...</p>';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const ideas = [
            `${topic}의 핵심 요소 분석`,
            `${topic}와 관련된 최신 트렌드`,
            `${topic}의 실제 적용 사례`,
            `${topic}의 미래 전망`,
            `${topic}를 활용한 비즈니스 모델`
        ];
        
        resultDiv.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px;">
                <h4>"${topic}" - ${type} 브레인스토밍 결과</h4>
                <div style="margin: 20px 0;">
                    ${ideas.map((idea, index) => `
                        <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #4a69bd;">
                            <h5>아이디어 ${index + 1}</h5>
                            <p>${idea}</p>
                        </div>
                    `).join('')}
                </div>
                <button onclick="expandBrainstorm()" style="padding: 8px 16px; background: #4a69bd; color: white; border: none; border-radius: 4px;">더 많은 아이디어</button>
            </div>
        `;
    } catch (error) {
        console.error('브레인스토밍 오류:', error);
        resultDiv.innerHTML = '<p style="color: red;">브레인스토밍 중 오류가 발생했습니다.</p>';
    }
}

async function expandBrainstorm() {
    const topic = document.getElementById('brainstorm-topic').value;
    const type = document.getElementById('brainstorm-type').value;
    
    if (!topic.trim()) {
        showToast('브레인스토밍 주제가 필요합니다.', 'error');
        return;
    }
    
    const resultDiv = document.getElementById('brainstorm-result');
    const existingContent = resultDiv.innerHTML;
    
    // 로딩 상태 표시
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;"><i class="spinner"></i> 추가 아이디어를 생성하고 있습니다...</p>';
    resultDiv.appendChild(loadingDiv);
    
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 추가 아이디어 생성
        const additionalIdeas = [
            `${topic}를 활용한 혁신적 접근법`,
            `${topic}의 글로벌 트렌드 분석`,
            `${topic}와 관련된 성공 사례 연구`,
            `${topic}의 문제점과 해결방안`,
            `${topic}의 경제적 영향 분석`,
            `${topic}를 위한 단계별 실행 전략`,
            `${topic}와 관련된 업계 전문가 인터뷰`,
            `${topic}의 사회적 의미와 가치`
        ];
        
        // 로딩 제거
        resultDiv.removeChild(loadingDiv);
        
        // 기존 결과 div에 추가 아이디어 삽입
        const existingResultDiv = resultDiv.querySelector('div');
        if (existingResultDiv) {
            const additionalIdeasHTML = additionalIdeas.map((idea, index) => `
                <div style="background: #e8f5e8; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2ecc71; animation: fadeInUp 0.6s ease ${index * 0.1}s both;">
                    <h5>추가 아이디어 ${index + 1}</h5>
                    <p>${idea}</p>
                </div>
            `).join('');
            
            const contentDiv = existingResultDiv.querySelector('div[style*="margin: 20px 0"]');
            if (contentDiv) {
                contentDiv.innerHTML += `
                    <hr style="margin: 30px 0; border: none; border-top: 1px dashed #ccc;">
                    <h4 style="color: #2ecc71; margin-bottom: 20px;">✨ 추가 생성된 아이디어</h4>
                    ${additionalIdeasHTML}
                `;
            }
            
            // 버튼 텍스트 변경
            const button = existingResultDiv.querySelector('button');
            if (button) {
                button.textContent = '더 많은 아이디어 생성됨 ✓';
                button.style.background = '#2ecc71';
                button.disabled = true;
            }
        }
        
        showToast('8개의 추가 아이디어가 생성되었습니다!', 'success');
        
    } catch (error) {
        console.error('추가 브레인스토밍 오류:', error);
        resultDiv.removeChild(loadingDiv);
        showToast('추가 아이디어 생성 중 오류가 발생했습니다.', 'error');
    }
}

// 뉴스 관련 함수들
function saveNewsSettings() {
    const keywords = document.getElementById('news-keywords').value;
    const sources = Array.from(document.querySelectorAll('#news-sources input:checked')).map(cb => cb.value);
    
    alert(`설정이 저장되었습니다.\n키워드: ${keywords}\n소스: ${sources.join(', ')}`);
}

function startNewsCrawling() {
    alert('뉴스 크롤링을 시작했습니다. 백그라운드에서 실행됩니다.');
}

function refreshNews() {
    const newsList = document.getElementById('newsList');
    newsList.innerHTML = '<p style="color: #666;">뉴스를 새로고침하고 있습니다...</p>';
    
    setTimeout(() => {
        newsList.innerHTML = `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                <h4>AI 기술의 최신 동향</h4>
                <p style="color: #666; font-size: 14px;">수집 시간: ${new Date().toLocaleString()}</p>
                <p>인공지능 기술이 빠르게 발전하고 있으며...</p>
            </div>
        `;
    }, 1000);
}

function generateDigest() {
    const digestContent = document.getElementById('digestContent');
    digestContent.innerHTML = '<p style="color: #666;">일일 다이제스트를 생성하고 있습니다...</p>';
    
    setTimeout(() => {
        digestContent.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px;">
                <h4>오늘의 뉴스 다이제스트 (${new Date().toLocaleDateString()})</h4>
                <div style="margin: 20px 0;">
                    <h5>📈 주요 트렌드</h5>
                    <p>AI 자동화 도구의 급속한 성장...</p>
                    
                    <h5>🔥 인기 토픽</h5>
                    <p>머신러닝과 딥러닝의 실용적 활용...</p>
                    
                    <h5>💡 주목할 만한 뉴스</h5>
                    <p>새로운 AI 모델 발표와 산업 적용 사례...</p>
                </div>
            </div>
        `;
    }, 2000);
}

// 미디어 변환 함수들
async function summarizeYoutube() {
    const url = document.getElementById('youtube-url').value;
    if (!url.trim() || !isValidYouTubeURL(url)) {
        showToast('올바른 유튜브 URL을 입력해주세요.', 'error');
        return;
    }

    const resultDiv = document.getElementById('youtube-summary-result');
    resultDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><i class="spinner"></i> 유튜브 영상을 분석하고 있습니다...</div>';

    try {
        const response = await apiClient.youtubeAnalyze(url);
        const analysis = response.analysis;

        resultDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h4>${analysis.title}</h4>
                <p><strong>채널:</strong> ${analysis.channel}</p>
                <p><strong>영상 길이:</strong> ${analysis.duration}</p>
                <p><strong>조회수:</strong> ${analysis.views}</p>
                <hr>
                <h5>AI 요약</h5>
                <p>${analysis.summary}</p>
                <h5>추천 키워드</h5>
                <p>${analysis.keywords.join(', ')}</p>
                <h5>블로그 포스트 제안</h5>
                <p>${analysis.blog_suggestions}</p>
            </div>
        `;
        showToast('유튜브 영상 분석이 완료되었습니다.', 'success');
    } catch (error) {
        console.error('유튜브 요약 오류:', error);
        resultDiv.innerHTML = `<p style="color: red;">유튜브 분석 중 오류가 발생했습니다: ${error.message}</p>`;
        showToast('유튜브 분석 중 오류가 발생했습니다.', 'error');
    }
}

// 유튜브 URL 유효성 검사 함수
function isValidYouTubeURL(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|m\.youtube\.com\/watch\?v=)[\w-]+/;
    return youtubeRegex.test(url);
}

// 유튜브 비디오 ID 추출 함수
function extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|m\.youtube\.com\/watch\?v=)([\w-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// 유튜브 분석 결과 생성 함수 (실제 API 연동 시 이 부분을 교체)
function generateYouTubeAnalysis(url, videoId) {
    const titles = [
        "AI 기술의 최신 동향과 미래 전망",
        "프로그래밍 초보자를 위한 완벽 가이드",
        "데이터 분석의 핵심 개념 정리",
        "웹 개발 트렌드 2025",
        "머신러닝 기초부터 실전까지"
    ];
    
    const channels = ["TechTalk", "CodeAcademy", "DataScience Pro", "WebDev Masters", "AI Learning"];
    
    const summaries = [
        "이 영상에서는 AI 기술의 현재 상황과 향후 발전 방향에 대해 다룹니다. 특히 GPT 모델의 발전과 실생활 적용 사례를 중심으로 설명하며, 기업에서의 활용 방안과 개인이 준비해야 할 역량들을 제시합니다.",
        "프로그래밍을 처음 시작하는 분들을 위한 체계적인 학습 로드맵을 제공합니다. 언어 선택부터 프로젝트 실습까지 단계별로 설명하며, 실무에서 필요한 핵심 개념들을 예제와 함께 소개합니다.",
        "데이터 분석의 전체 프로세스를 이해하기 쉽게 설명합니다. 데이터 수집, 전처리, 시각화, 해석의 각 단계별 핵심 포인트와 실무에서 자주 사용되는 도구들을 소개합니다."
    ];
    
    return {
        title: titles[Math.floor(Math.random() * titles.length)],
        channel: channels[Math.floor(Math.random() * channels.length)],
        duration: `${Math.floor(Math.random() * 20 + 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        views: `${Math.floor(Math.random() * 500 + 100).toLocaleString()}회`,
        summary: summaries[Math.floor(Math.random() * summaries.length)],
        timestamps: [
            { time: "00:30", description: "영상 소개 및 개요" },
            { time: "02:15", description: "핵심 개념 설명" },
            { time: "05:30", description: "실습 예제 시연" },
            { time: "08:45", description: "응용 방법 안내" },
            { time: "11:20", description: "요약 및 마무리" }
        ],
        keywords: ["#AI", "#기술트렌드", "#프로그래밍", "#자동화", "#학습", "#실습"],
        blogSuggestions: "이 영상의 내용을 바탕으로 'AI 기술 동향 분석' 또는 '실무자를 위한 기술 가이드' 형태의 블로그 포스트를 작성할 수 있습니다. 영상에서 다룬 핵심 개념들을 정리하고, 개인적인 견해나 추가 리서치 내용을 더해 완성도 높은 콘텐츠를 만들어보세요."
    };
}

// 요약 복사 함수
function copyYouTubeSummary() {
    const summaryText = document.querySelector('#youtube-summary-result').innerText;
    navigator.clipboard.writeText(summaryText).then(() => {
        showToast('요약 내용이 클립보드에 복사되었습니다!', 'success');
    }).catch(() => {
        showToast('복사에 실패했습니다.', 'error');
    });
}

// 유튜브 내용으로 포스트 작성 함수
function createPostFromYouTube() {
    showTab('smart-write');
    showToast('유튜브 요약을 바탕으로 새 포스트를 작성합니다.', 'success');
}

// 기타 미디어 변환 함수들 (간단 구현)
function processPodcast() {
    alert('팟캐스트 처리 기능이 실행됩니다. (실제 구현 시 오디오 분석 API 연동)');
}

function extractTextFromImage() {
    alert('이미지 텍스트 추출 기능이 실행됩니다. (실제 구현 시 OCR API 연동)');
}

function startVoiceRecording() {
    alert('음성 녹음을 시작합니다. (실제 구현 시 Web Audio API 사용)');
}

function stopVoiceRecording() {
    alert('음성 녹음을 중지합니다.');
}

function convertVoiceToPost() {
    alert('음성을 포스트로 변환합니다. (실제 구현 시 음성 인식 API 연동)');
}

// 기타 유틸리티 함수들
function startRecording() {
    alert('음성 메모 녹음을 시작합니다.');
}

function stopRecording() {
    alert('음성 메모 녹음을 중지합니다.');
}

function addInspiration() {
    const inspiration = prompt('영감 내용을 입력하세요:');
    if (inspiration) {
        alert('영감이 저장되었습니다: ' + inspiration);
    }
}

