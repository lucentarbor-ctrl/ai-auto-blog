// 사이드바 기능
class SidebarManager {
    constructor() {
        this.sidebar = null;
        this.currentPage = '';
        this.init();
    }

    init() {
        // DOM이 로드된 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // 사이드바 로드
        this.loadSidebar();
        
        // 로컬 스토리지에서 사이드바 상태 복원
        this.restoreSidebarState();
    }

    async loadSidebar() {
        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
        if (!sidebarPlaceholder) return;

        try {
            const response = await fetch('sidebar.html');
            const html = await response.text();
            sidebarPlaceholder.innerHTML = html;
            
            this.sidebar = sidebarPlaceholder.querySelector('.sidebar');
            this.setupEventListeners();
            this.setActiveMenuItem();
        } catch (error) {
            console.error('사이드바 로드 실패:', error);
        }
    }

    setupEventListeners() {
        // 사이드바 토글 버튼
        const toggleBtn = this.sidebar.querySelector('.sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // 모바일 메뉴 토글
        this.setupMobileMenu();
    }

    toggleSidebar() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.toggle('collapsed');
        
        // 상태 저장
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
        
        // 메인 콘텐츠 조정
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.marginLeft = isCollapsed ? '60px' : '280px';
        }
    }

    restoreSidebarState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed && this.sidebar) {
            this.sidebar.classList.add('collapsed');
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.marginLeft = '60px';
            }
        }
    }

    setActiveMenuItem() {
        // 현재 페이지 파일명 가져오기
        const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
        const currentPage = currentFile.replace('.html', '');
        
        // URL 파라미터 확인 (courses.html?type=notion 같은 경우)
        const urlParams = new URLSearchParams(window.location.search);
        const courseType = urlParams.get('type');
        
        if (courseType) {
            this.currentPage = `${courseType}-course`;
        } else {
            this.currentPage = currentPage;
        }
        
        // 모든 nav-item에서 active 클래스 제거
        const navItems = this.sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        // 현재 페이지에 해당하는 메뉴 아이템 활성화
        const activeItem = this.sidebar.querySelector(`[data-page="${this.currentPage}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    setupMobileMenu() {
        // 모바일 메뉴 버튼 생성
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-btn')) {
            const mobileMenuBtn = document.createElement('button');
            mobileMenuBtn.className = 'mobile-menu-btn';
            mobileMenuBtn.innerHTML = '☰';
            mobileMenuBtn.style.cssText = `
                position: fixed;
                top: 1rem;
                left: 1rem;
                z-index: 1001;
                background: #3b82f6;
                color: white;
                border: none;
                padding: 0.5rem;
                border-radius: 0.25rem;
                font-size: 1.5rem;
                cursor: pointer;
            `;
            
            mobileMenuBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('mobile-open');
            });
            
            document.body.appendChild(mobileMenuBtn);
        }
        
        // 모바일에서 메뉴 클릭 시 사이드바 닫기
        if (window.innerWidth <= 768) {
            const navItems = this.sidebar.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    this.sidebar.classList.remove('mobile-open');
                });
            });
        }
    }
}

// 전역 함수
function toggleSidebar() {
    if (window.sidebarManager) {
        window.sidebarManager.toggleSidebar();
    }
}

// 초기화
window.sidebarManager = new SidebarManager();