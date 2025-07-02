// 대시보드 실시간 데이터 관리
class DashboardManager {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
        this.views = JSON.parse(localStorage.getItem('blog_views') || '{}');
        this.subscribers = parseInt(localStorage.getItem('blog_subscribers') || '0');
        this.initializeData();
    }

    initializeData() {
        // 초기 데이터가 없으면 샘플 데이터 생성
        if (this.posts.length === 0) {
            this.createSampleData();
        }
    }

    createSampleData() {
        const samplePosts = [
            {
                id: Date.now() - 86400000 * 5,
                title: 'AI 시대의 블로깅 전략',
                category: 'AI',
                tags: ['AI', '블로깅', '전략'],
                views: 342,
                likes: 23,
                comments: 5,
                created: new Date(Date.now() - 86400000 * 5).toISOString(),
                status: 'published'
            },
            {
                id: Date.now() - 86400000 * 3,
                title: '옵시디언으로 지식 관리하기',
                category: '생산성',
                tags: ['옵시디언', '노트', 'PKM'],
                views: 289,
                likes: 19,
                comments: 8,
                created: new Date(Date.now() - 86400000 * 3).toISOString(),
                status: 'published'
            },
            {
                id: Date.now() - 86400000,
                title: 'ChatGPT 활용법 총정리',
                category: 'AI',
                tags: ['ChatGPT', 'AI', '튜토리얼'],
                views: 567,
                likes: 45,
                comments: 12,
                created: new Date(Date.now() - 86400000).toISOString(),
                status: 'published'
            }
        ];
        
        this.posts = samplePosts;
        localStorage.setItem('blog_posts', JSON.stringify(this.posts));
        
        // 조회수 데이터
        const viewsData = {};
        samplePosts.forEach(post => {
            viewsData[post.id] = post.views;
        });
        this.views = viewsData;
        localStorage.setItem('blog_views', JSON.stringify(this.views));
        
        // 구독자 수
        this.subscribers = 127;
        localStorage.setItem('blog_subscribers', this.subscribers.toString());
    }

    // 통계 계산
    getStats() {
        const now = new Date();
        const thisMonth = now.getMonth();
        const lastMonth = new Date(now.getFullYear(), thisMonth - 1, 1);
        
        // 이번 달 게시글
        const thisMonthPosts = this.posts.filter(post => {
            const postDate = new Date(post.created);
            return postDate.getMonth() === thisMonth && post.status === 'published';
        });
        
        // 총 조회수
        const totalViews = Object.values(this.views).reduce((sum, views) => sum + views, 0);
        
        // 평균 참여율 (좋아요 + 댓글 / 조회수)
        let totalEngagement = 0;
        let postCount = 0;
        this.posts.forEach(post => {
            if (post.views > 0) {
                const engagement = ((post.likes + post.comments) / post.views) * 100;
                totalEngagement += engagement;
                postCount++;
            }
        });
        const avgEngagement = postCount > 0 ? (totalEngagement / postCount).toFixed(1) : 0;
        
        // 지난주 대비 조회수 증가율 (시뮬레이션)
        const viewGrowth = Math.floor(Math.random() * 20) + 5;
        
        // 구독자 증가율 (시뮬레이션)
        const subGrowth = Math.floor(Math.random() * 10) + 3;
        
        return {
            totalViews: totalViews.toLocaleString(),
            publishedPosts: this.posts.filter(p => p.status === 'published').length,
            subscribers: this.subscribers.toLocaleString(),
            engagement: avgEngagement + '%',
            viewGrowth: viewGrowth,
            subGrowth: subGrowth,
            thisMonthPosts: thisMonthPosts.length,
            drafts: this.posts.filter(p => p.status === 'draft').length
        };
    }

    // 최근 활동
    getRecentActivity() {
        const activities = [];
        
        // 최근 게시글
        this.posts.slice(-3).reverse().forEach(post => {
            activities.push({
                type: 'post',
                icon: 'fa-file-text',
                title: `"${post.title}" 발행`,
                time: this.getRelativeTime(post.created),
                color: 'text-primary'
            });
        });
        
        // 시뮬레이션된 활동들
        activities.push({
            type: 'comment',
            icon: 'fa-comment',
            title: '새 댓글 3개',
            time: '2시간 전',
            color: 'text-info'
        });
        
        activities.push({
            type: 'subscriber',
            icon: 'fa-user-plus',
            title: '신규 구독자 +5',
            time: '5시간 전',
            color: 'text-success'
        });
        
        return activities;
    }

    // 인기 게시글
    getPopularPosts() {
        return this.posts
            .filter(p => p.status === 'published')
            .sort((a, b) => b.views - a.views)
            .slice(0, 5)
            .map(post => ({
                ...post,
                viewsFormatted: post.views.toLocaleString()
            }));
    }

    // 카테고리별 통계
    getCategoryStats() {
        const stats = {};
        this.posts.forEach(post => {
            if (!stats[post.category]) {
                stats[post.category] = {
                    name: post.category,
                    count: 0,
                    views: 0
                };
            }
            stats[post.category].count++;
            stats[post.category].views += post.views || 0;
        });
        
        return Object.values(stats).sort((a, b) => b.views - a.views);
    }

    // 시간대별 조회수 (시뮬레이션)
    getHourlyViews() {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            hours.push({
                hour: i,
                views: Math.floor(Math.random() * 100) + 20
            });
        }
        return hours;
    }

    // 상대적 시간 계산
    getRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;
        
        return date.toLocaleDateString('ko-KR');
    }

    // 조회수 증가 (시뮬레이션)
    incrementViews(postId) {
        if (!this.views[postId]) {
            this.views[postId] = 0;
        }
        this.views[postId]++;
        localStorage.setItem('blog_views', JSON.stringify(this.views));
        
        // posts 배열도 업데이트
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.views = this.views[postId];
            localStorage.setItem('blog_posts', JSON.stringify(this.posts));
        }
    }

    // 새 게시글 추가
    addPost(postData) {
        const newPost = {
            id: Date.now(),
            ...postData,
            views: 0,
            likes: 0,
            comments: 0,
            created: new Date().toISOString(),
            status: 'draft'
        };
        
        this.posts.push(newPost);
        localStorage.setItem('blog_posts', JSON.stringify(this.posts));
        
        return newPost;
    }

    // 게시글 발행
    publishPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.status = 'published';
            post.publishedAt = new Date().toISOString();
            localStorage.setItem('blog_posts', JSON.stringify(this.posts));
        }
    }

    // 구독자 증가 (시뮬레이션)
    addSubscriber() {
        this.subscribers++;
        localStorage.setItem('blog_subscribers', this.subscribers.toString());
    }
}

// 대시보드 UI 업데이트
function updateDashboard() {
    const dashboard = new DashboardManager();
    const stats = dashboard.getStats();
    
    // 통계 카드 업데이트
    updateStatCard('totalViews', stats.totalViews, stats.viewGrowth, true);
    updateStatCard('publishedPosts', stats.publishedPosts, `이번 달 +${stats.thisMonthPosts}`);
    updateStatCard('subscribers', stats.subscribers, stats.subGrowth, true);
    updateStatCard('engagement', stats.engagement, -0.3, false);
    
    // 최근 활동 업데이트
    updateRecentActivity(dashboard.getRecentActivity());
    
    // 인기 게시글 업데이트
    updatePopularPosts(dashboard.getPopularPosts());
    
    // 카테고리 통계
    updateCategoryStats(dashboard.getCategoryStats());
}

// 통계 카드 업데이트
function updateStatCard(id, value, change, isPositive) {
    const card = document.querySelector(`[data-stat="${id}"]`);
    if (!card) return;
    
    const valueEl = card.querySelector('.stat-value');
    const changeEl = card.querySelector('.stat-change');
    
    if (valueEl) valueEl.textContent = value;
    
    if (changeEl && typeof change === 'number') {
        changeEl.innerHTML = `<i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i> ${Math.abs(change)}% ${isPositive ? '증가' : '감소'}`;
        changeEl.className = `stat-change ${isPositive ? '' : 'down'}`;
    } else if (changeEl) {
        changeEl.textContent = change;
    }
}

// 최근 활동 업데이트
function updateRecentActivity(activities) {
    const container = document.getElementById('recentActivityList');
    if (!container) return;
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <i class="fas ${activity.icon} ${activity.color}"></i>
            <div class="activity-content">
                <p>${activity.title}</p>
                <small>${activity.time}</small>
            </div>
        </div>
    `).join('');
}

// 인기 게시글 업데이트
function updatePopularPosts(posts) {
    const container = document.getElementById('popularPostsList');
    if (!container) return;
    
    container.innerHTML = posts.map((post, index) => `
        <div class="popular-post">
            <span class="rank">${index + 1}</span>
            <div class="post-info">
                <h5>${post.title}</h5>
                <small>${post.viewsFormatted} 조회 • ${post.category}</small>
            </div>
        </div>
    `).join('');
}

// 카테고리 통계 업데이트
function updateCategoryStats(stats) {
    const container = document.getElementById('categoryStats');
    if (!container) return;
    
    container.innerHTML = stats.map(cat => `
        <div class="category-stat">
            <div class="category-name">${cat.name}</div>
            <div class="category-bar">
                <div class="bar-fill" style="width: ${(cat.views / Math.max(...stats.map(s => s.views))) * 100}%"></div>
            </div>
            <div class="category-count">${cat.count}개 • ${cat.views.toLocaleString()} 조회</div>
        </div>
    `).join('');
}

// 실시간 업데이트 (5초마다)
setInterval(() => {
    const dashboard = new DashboardManager();
    
    // 랜덤하게 조회수 증가
    if (Math.random() > 0.7) {
        const posts = dashboard.posts.filter(p => p.status === 'published');
        if (posts.length > 0) {
            const randomPost = posts[Math.floor(Math.random() * posts.length)];
            dashboard.incrementViews(randomPost.id);
        }
    }
    
    // 가끔 구독자 증가
    if (Math.random() > 0.95) {
        dashboard.addSubscriber();
    }
    
    // 대시보드 업데이트
    updateDashboard();
}, 5000);

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', updateDashboard);