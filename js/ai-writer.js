// AI 글쓰기 도우미 - 프론트엔드 통합
class AIWriter {
    constructor() {
        this.apiBase = 'http://localhost:5002/api/ai';
        this.currentEditor = null;
        this.slashMenuVisible = false;
        this.selectedText = '';
    }

    // 에디터에 AI 기능 통합
    integrateWithEditor(editorElement) {
        this.currentEditor = editorElement;
        
        // 슬래시 명령어 메뉴 생성
        this.createSlashMenu();
        
        // 이벤트 리스너 등록
        editorElement.addEventListener('input', (e) => this.handleInput(e));
        editorElement.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('mouseup', () => this.handleSelection());
    }

    // 슬래시 메뉴 생성
    createSlashMenu() {
        const menu = document.createElement('div');
        menu.className = 'ai-slash-menu';
        menu.innerHTML = `
            <div class="slash-item" data-command="title">
                <span class="icon">📝</span>
                <span>제목 생성</span>
            </div>
            <div class="slash-item" data-command="expand">
                <span class="icon">➕</span>
                <span>확장하기</span>
            </div>
            <div class="slash-item" data-command="tone">
                <span class="icon">🎭</span>
                <span>톤 변경</span>
            </div>
        `;
        document.body.appendChild(menu);
        this.slashMenu = menu;
        
        // 메뉴 아이템 클릭 처리
        menu.querySelectorAll('.slash-item').forEach(item => {
            item.addEventListener('click', () => {
                this.executeCommand(item.dataset.command);
            });
        });
    }

    // 입력 처리
    handleInput(e) {
        const text = e.target.innerText;
        const lastChar = text[text.length - 1];
        
        if (lastChar === '/') {
            this.showSlashMenu();
        } else {
            this.hideSlashMenu();
        }
    }

    // 슬래시 메뉴 표시
    showSlashMenu() {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        this.slashMenu.style.display = 'block';
        this.slashMenu.style.left = rect.left + 'px';
        this.slashMenu.style.top = (rect.bottom + 5) + 'px';
        this.slashMenuVisible = true;
    }

    // 슬래시 메뉴 숨기기
    hideSlashMenu() {
        this.slashMenu.style.display = 'none';
        this.slashMenuVisible = false;
    }

    // 명령 실행
    async executeCommand(command) {
        this.hideSlashMenu();
        
        // 슬래시 문자 제거
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.setStart(range.startContainer, range.startOffset - 1);
        range.deleteContents();
        
        // 로딩 표시
        this.showLoading();
        
        try {
            switch(command) {
                case 'title':
                    await this.generateTitles();
                    break;
                case 'expand':
                    await this.expandText();
                    break;
                case 'tone':
                    await this.changeTone();
                    break;
            }
        } catch (error) {
            console.error('AI 명령 실행 오류:', error);
            this.showError('AI 처리 중 오류가 발생했습니다.');
        }
        
        this.hideLoading();
    }

    // 제목 생성
    async generateTitles() {
        const topic = prompt('어떤 주제로 제목을 생성할까요?');
        if (!topic) return;
        
        const response = await fetch(`${this.apiBase}/generate-titles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            this.showTitleSuggestions(data.titles);
        }
    }

    // 제목 제안 표시
    showTitleSuggestions(titles) {
        const panel = document.createElement('div');
        panel.className = 'ai-suggestions-panel';
        panel.innerHTML = `
            <h3>추천 제목</h3>
            ${titles.map(item => `
                <div class="suggestion-item" onclick="aiWriter.insertTitle('${item.title}')">
                    <h4>${item.title}</h4>
                    <p>SEO 점수: ${item.seo_score}/100</p>
                </div>
            `).join('')}
            <button onclick="this.parentElement.remove()">닫기</button>
        `;
        document.body.appendChild(panel);
    }

    // 제목 삽입
    insertTitle(title) {
        // 제목 입력 필드가 있으면 거기에, 없으면 에디터에 삽입
        const titleInput = document.getElementById('postTitle');
        if (titleInput) {
            titleInput.value = title;
        } else {
            this.insertTextAtCursor(title);
        }
        
        // 제안 패널 닫기
        document.querySelector('.ai-suggestions-panel')?.remove();
    }

    // 텍스트 확장
    async expandText() {
        if (!this.selectedText) {
            alert('확장할 텍스트를 먼저 선택해주세요.');
            return;
        }
        
        const response = await fetch(`${this.apiBase}/expand`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: this.selectedText })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            this.replaceSelectedText(data.expanded_text);
        }
    }

    // 선택된 텍스트 교체
    replaceSelectedText(newText) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(newText));
        }
    }

    // 커서 위치에 텍스트 삽입
    insertTextAtCursor(text) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(document.createTextNode(text));
        }
    }

    // 텍스트 선택 처리
    handleSelection() {
        const selection = window.getSelection();
        this.selectedText = selection.toString().trim();
        
        if (this.selectedText) {
            this.showFloatingToolbar(selection);
        } else {
            this.hideFloatingToolbar();
        }
    }

    // 플로팅 툴바 표시
    showFloatingToolbar(selection) {
        if (!this.floatingToolbar) {
            this.createFloatingToolbar();
        }
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        this.floatingToolbar.style.display = 'flex';
        this.floatingToolbar.style.left = rect.left + 'px';
        this.floatingToolbar.style.top = (rect.top - 40) + 'px';
    }

    // 플로팅 툴바 생성
    createFloatingToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'ai-floating-toolbar';
        toolbar.innerHTML = `
            <button onclick="aiWriter.expandText()">확장</button>
            <button onclick="aiWriter.summarizeText()">요약</button>
            <button onclick="aiWriter.changeTone()">톤 변경</button>
        `;
        document.body.appendChild(toolbar);
        this.floatingToolbar = toolbar;
    }

    // 플로팅 툴바 숨기기
    hideFloatingToolbar() {
        if (this.floatingToolbar) {
            this.floatingToolbar.style.display = 'none';
        }
    }

    // 로딩 표시
    showLoading() {
        // 간단한 로딩 표시
        this.currentEditor.style.opacity = '0.6';
    }

    // 로딩 숨기기
    hideLoading() {
        this.currentEditor.style.opacity = '1';
    }

    // 에러 표시
    showError(message) {
        alert(message); // 나중에 더 예쁜 알림으로 교체
    }
}

// 전역 인스턴스 생성
const aiWriter = new AIWriter();

// CSS 스타일 추가
const style = document.createElement('style');
style.textContent = `
.ai-slash-menu {
    position: absolute;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 8px;
    display: none;
    z-index: 1000;
}

.slash-item {
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.slash-item:hover {
    background: #f0f0f0;
}

.ai-floating-toolbar {
    position: absolute;
    background: #333;
    color: white;
    border-radius: 6px;
    padding: 4px;
    display: none;
    gap: 4px;
    z-index: 1001;
}

.ai-floating-toolbar button {
    background: none;
    border: none;
    color: white;
    padding: 6px 10px;
    cursor: pointer;
    border-radius: 4px;
}

.ai-floating-toolbar button:hover {
    background: rgba(255,255,255,0.2);
}

.ai-suggestions-panel {
    position: fixed;
    right: 20px;
    top: 100px;
    width: 300px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 20px;
    z-index: 1000;
}

.suggestion-item {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
}

.suggestion-item:hover {
    background: #e9ecef;
}
`;
document.head.appendChild(style);