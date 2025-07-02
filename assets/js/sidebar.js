// AI 자동블로그 사이드바 JavaScript

class AIBlogSidebar {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadDynamicContent();
        this.initializeSearch();
        this.initializeNewsletter();
    }

    initializeElements() {
        this.sidebar = document.getElementById('ai-blog-sidebar');
        this.searchForm = document.querySelector('.search-form');
        this.searchInput = document.querySelector('input[type="search"]');
        this.newsletterForm = document.querySelector('.newsletter-form');
        this.categoryItems = document.querySelectorAll('.category-item');
        this.tagItems = document.querySelectorAll('.tag-item');
    }

    attachEventListeners() {
        // 카테고리 클릭 트래킹
        this.categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const categoryName = item.querySelector('.category-name').textContent;
                this.trackEvent('category_click', { category: categoryName });
            });
        });

        // 태그 클릭 트래킹
        this.tagItems.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const tagName = tag.textContent;
                this.trackEvent('tag_click', { tag: tagName });
            });
        });

        // 사이드바 스크롤 위치 저장
        this.sidebar.addEventListener('scroll', () => {
            this.saveScrollPosition();
        });
    }

    initializeSearch() {
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = this.searchInput.value.trim();
            
            if (query) {
                this.performSearch(query);
            }
        });

        // 실시간 검색 제안
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length > 2) {
                searchTimeout = setTimeout(() => {
                    this.showSearchSuggestions(query);
                }, 300);
            } else {
                this.hideSearchSuggestions();
            }
        });
    }

    performSearch(query) {
        // 실제 환경에서는 서버로 검색 요청
        console.log('검색 중:', query);
        
        // 검색 결과 페이지로 이동
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }

    showSearchSuggestions(query) {
        // 검색 제안 표시 로직
        // 실제 환경에서는 서버에서 제안 목록 가져오기
        console.log('검색 제안 표시:', query);
    }

    hideSearchSuggestions() {
        // 검색 제안 숨기기
        const suggestions = document.querySelector('.search-suggestions');
        if (suggestions) {
            suggestions.remove();
        }
    }

    initializeNewsletter() {
        this.newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = this.newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (this.validateEmail(email)) {
                await this.subscribeToNewsletter(email);
            }
        });
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async subscribeToNewsletter(email) {
        try {
            // 실제 환경에서는 서버로 구독 요청
            console.log('뉴스레터 구독:', email);
            
            // 성공 메시지 표시
            this.showNotification('구독 완료! 이메일을 확인해주세요.', 'success');
            
            // 폼 초기화
            this.newsletterForm.reset();
        } catch (error) {
            this.showNotification('구독 중 오류가 발생했습니다.', 'error');
        }
    }

    loadDynamicContent() {
        // 실시간 업데이트가 필요한 콘텐츠 로드
        this.updateRecentPosts();
        this.updatePopularPosts();
        this.updatePostCounts();
    }

    async updateRecentPosts() {
        try {
            // 실제 환경에서는 서버에서 최근 글 목록 가져오기
            const recentPosts = await this.fetchRecentPosts();
            this.renderRecentPosts(recentPosts);
        } catch (error) {
            console.error('최근 글 업데이트 실패:', error);
        }
    }

    async updatePopularPosts() {
        try {
            // 실제 환경에서는 서버에서 인기 글 목록 가져오기
            const popularPosts = await this.fetchPopularPosts();
            this.renderPopularPosts(popularPosts);
        } catch (error) {
            console.error('인기 글 업데이트 실패:', error);
        }
    }

    async updatePostCounts() {
        // 카테고리별 글 수 업데이트
        const categoryCounts = await this.fetchCategoryCounts();
        this.updateCategoryBadges(categoryCounts);
        
        // 아카이브 글 수 업데이트
        const archiveCounts = await this.fetchArchiveCounts();
        this.updateArchiveBadges(archiveCounts);
    }

    // API 호출 시뮬레이션 (실제로는 fetch 사용)
    async fetchRecentPosts() {
        // return await fetch('/api/posts/recent').then(res => res.json());
        return [];
    }

    async fetchPopularPosts() {
        // return await fetch('/api/posts/popular').then(res => res.json());
        return [];
    }

    async fetchCategoryCounts() {
        // return await fetch('/api/categories/counts').then(res => res.json());
        return {};
    }

    async fetchArchiveCounts() {
        // return await fetch('/api/archives/counts').then(res => res.json());
        return {};
    }

    renderRecentPosts(posts) {
        const listElement = document.querySelector('.recent-posts-list');
        if (!listElement || posts.length === 0) return;
        
        // 최근 글 목록 렌더링
    }

    renderPopularPosts(posts) {
        const listElement = document.querySelector('.popular-posts-list');
        if (!listElement || posts.length === 0) return;
        
        // 인기 글 목록 렌더링
    }

    updateCategoryBadges(counts) {
        Object.entries(counts).forEach(([category, count]) => {
            const badge = document.querySelector(`[data-category="${category}"] .post-count`);
            if (badge) {
                badge.textContent = count;
            }
        });
    }

    updateArchiveBadges(counts) {
        Object.entries(counts).forEach(([archive, count]) => {
            const badge = document.querySelector(`[data-archive="${archive}"] .post-count`);
            if (badge) {
                badge.textContent = count;
            }
        });
    }

    saveScrollPosition() {
        localStorage.setItem('sidebarScrollPosition', this.sidebar.scrollTop);
    }

    restoreScrollPosition() {
        const savedPosition = localStorage.getItem('sidebarScrollPosition');
        if (savedPosition) {
            this.sidebar.scrollTop = parseInt(savedPosition);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 애니메이션으로 표시
        setTimeout(() => notification.classList.add('show'), 10);
        
        // 3초 후 제거
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    trackEvent(eventName, data) {
        // 분석 도구로 이벤트 전송
        console.log('Event tracked:', eventName, data);
        
        // Google Analytics 예시
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
    }
}

// 사이드바 초기화
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new AIBlogSidebar();
    
    // 스크롤 위치 복원
    sidebar.restoreScrollPosition();
    
    // 주기적으로 콘텐츠 업데이트 (5분마다)
    setInterval(() => {
        sidebar.loadDynamicContent();
    }, 5 * 60 * 1000);
});

// 유틸리티 함수들
const SidebarUtils = {
    // 날짜 포맷팅
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    },
    
    // 조회수 포맷팅
    formatViewCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    },
    
    // 상대 시간 계산
    getRelativeTime(date) {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) {
            return `${diffMins}분 전`;
        } else if (diffHours < 24) {
            return `${diffHours}시간 전`;
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else {
            return this.formatDate(date);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIBlogSidebar, SidebarUtils };
}