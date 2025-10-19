// API 클라이언트 - 모든 서버 통신을 관리
const API_BASE_URL = 'http://3.34.5.55:5000';

class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // 기본 fetch 래퍼
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // ===== 대시보드 API =====
    async getDashboardStats() {
        return this.request('/stats');
    }

    async getInsights(unreadOnly = false) {
        return this.request(`/insights${unreadOnly ? '?unread_only=true' : ''}`);
    }

    async getTrendingKeywords(limit = 10) {
        const response = await this.request(`/trending-keywords?limit=${limit}`);
        return response.keywords || [];
    }

    async getAnalyticsByPeriod(days) {
        return this.request(`/analytics/period/${days}`);
    }

    // ===== 포스트 API =====
    async getPosts(status = null) {
        const query = status ? `?status=${status}` : '';
        return this.request(`/posts${query}`);
    }

    async getPost(postId) {
        return this.request(`/posts/${postId}`);
    }

    async createPost(postData) {
        return this.request('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    }

    async updatePost(postId, postData) {
        return this.request(`/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    }

    async deletePost(postId) {
        return this.request(`/posts/${postId}`, {
            method: 'DELETE'
        });
    }

    async getPostVersions(postId) {
        return this.request(`/posts/${postId}/versions`);
    }

    async getPostVersion(versionId) {
        return this.request(`/versions/${versionId}`);
    }

    // ===== Series API =====
    async getSeries() {
        return this.request('/series');
    }

    async createSeries(seriesData) {
        return this.request('/series', {
            method: 'POST',
            body: JSON.stringify(seriesData)
        });
    }

    // ===== 아이디어 API =====
    async getIdeas() {
        return this.request('/ideas');
    }

    async createIdea(ideaData) {
        return this.request('/ideas', {
            method: 'POST',
            body: JSON.stringify(ideaData)
        });
    }

    // ===== AI 기능 API =====
    async generateTitles(topic, keywords = []) {
        return this.request('/ai/generate-titles', {
            method: 'POST',
            body: JSON.stringify({ topic, keywords })
        });
    }

    async youtubeAnalyze(url) {
        return this.request('/youtube/analyze', {
            method: 'POST',
            body: JSON.stringify({ url })
        });
    }

    async smartResearch(query) {
        return this.request('/ai/research', {
            method: 'POST',
            body: JSON.stringify({ query })
        });
    }

    async generateContent(templateType, params) {
        return this.request('/ai/generate', {
            method: 'POST',
            body: JSON.stringify({ template: templateType, ...params })
        });
    }

    async changeTone(text, targetTone) {
        return this.request('/ai/tone', {
            method: 'POST',
            body: JSON.stringify({ text, tone: targetTone })
        });
    }

    async checkFacts(content) {
        return this.request('/ai/fact-check', {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    async abTestTitles(titleA, titleB) {
        return this.request('/ai/ab-test-titles', {
            method: 'POST',
            body: JSON.stringify({ title_a: titleA, title_b: titleB })
        });
    }

    // ===== SEO API =====
    async analyzeSEO(content) {
        return this.request('/seo/analyze', {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    async generateMetaTags(title, content) {
        return this.request('/seo/meta-tags', {
            method: 'POST',
            body: JSON.stringify({ title, content })
        });
    }

    // ===== 뉴스 크롤링 API =====
    async getNews() {
        return this.request('/news');
    }

    async runCrawling(keywords) {
        return this.request('/crawling/run', {
            method: 'POST',
            body: JSON.stringify({ keywords })
        });
    }

    // ===== 이미지 생성 API =====
    async generateThumbnail(text, style) {
        return this.request('/ai/generate-thumbnail', {
            method: 'POST',
            body: JSON.stringify({ text, style })
        });
    }

    // ===== 해시태그 API =====
    async generateHashtags(content) {
        return this.request('/hashtags/generate', {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    // ===== 가독성 분석 API =====
    async analyzeReadability(content) {
        return this.request('/readability/analyze', {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    // ===== 사용자 활동 API =====
    async trackUserActivity(activityData) {
        return this.request('/user-activity', {
            method: 'POST',
            body: JSON.stringify(activityData)
        });
    }

    // ===== 시드 데이터 (개발용) =====
    async seedData() {
        return this.request('/seed-data', {
            method: 'POST'
        });
    }
}

// 전역 API 클라이언트 인스턴스
const apiClient = new APIClient();

// 전역으로 노출 (다른 스크립트에서 사용 가능)
window.apiClient = apiClient;