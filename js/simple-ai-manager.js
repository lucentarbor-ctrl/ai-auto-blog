// 간단한 AI 매니저 - 즉시 사용 가능
class SimpleAIManager {
    constructor() {
        // Gemini API는 이미 있음
        this.geminiKey = 'AIzaSyAmLSwyMGCkDpSojwPjQwTnYmlAQjrdH7g';
        
        // 모델 설정 (단순화)
        this.models = {
            // 1. 메인: Gemini Flash (무료 쿼터 많음)
            main: {
                name: 'Gemini 2.5 Flash',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
                apiKey: this.geminiKey,
                freeQuota: true,
                quality: 'high'
            },
            
            // 2. 보조: Gemini Pro (무료 쿼터)
            premium: {
                name: 'Gemini 2.5 Pro',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
                apiKey: this.geminiKey,
                freeQuota: true,
                quality: 'very high'
            },
            
            // 3. 로컬: Ollama (설치시 사용)
            local: {
                name: 'Ollama (Local)',
                endpoint: 'http://localhost:11434/api/generate',
                model: 'llama3.2',
                quality: 'medium',
                available: false
            }
        };
        
        // Ollama 가용성 체크
        this.checkOllama();
    }
    
    async checkOllama() {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            if (response.ok) {
                this.models.local.available = true;
                console.log('✅ Ollama 사용 가능');
            }
        } catch (e) {
            console.log('ℹ️ Ollama 미설치 - Gemini만 사용');
        }
    }
    
    // 심플한 콘텐츠 생성 (자동 모델 선택)
    async generateContent(prompt, options = {}) {
        const { 
            mode = 'balanced',  // balanced, quality, speed, free
            maxTokens = 2048,
            temperature = 0.7
        } = options;
        
        try {
            // 모드별 자동 모델 선택
            let model;
            switch(mode) {
                case 'quality':
                    model = this.models.premium;
                    break;
                case 'free':
                    model = this.models.local.available ? this.models.local : this.models.main;
                    break;
                case 'speed':
                default:
                    model = this.models.main;
            }
            
            console.log(`🤖 사용 모델: ${model.name}`);
            
            // API 호출
            if (model.name.includes('Gemini')) {
                return await this.callGemini(prompt, model, maxTokens, temperature);
            } else if (model.name.includes('Ollama')) {
                return await this.callOllama(prompt, model);
            }
        } catch (error) {
            console.error('AI 생성 오류:', error);
            // 오류시 다른 모델로 자동 전환
            if (this.models.local.available) {
                console.log('🔄 로컬 모델로 전환');
                return await this.callOllama(prompt, this.models.local);
            }
            throw error;
        }
    }
    
    async callGemini(prompt, model, maxTokens, temperature) {
        const response = await fetch(`${model.endpoint}?key=${model.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                    topP: 0.95
                }
            })
        });
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    
    async callOllama(prompt, model) {
        const response = await fetch(model.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model.model,
                prompt: prompt,
                stream: false
            })
        });
        
        const data = await response.json();
        return data.response || '';
    }
    
    // 믹스 모드 - 여러 단계로 나눠서 생성 (품질 향상)
    async generateMixedContent(topic, style = 'professional') {
        console.log('🎨 믹스 모드 시작...');
        
        // 1단계: 개요 생성 (빠른 모델)
        const outline = await this.generateContent(
            `"${topic}"에 대한 블로그 포스트 개요를 작성해주세요. 
            5개의 주요 섹션과 각 섹션의 핵심 포인트를 포함해주세요.`,
            { mode: 'speed' }
        );
        
        // 2단계: 본문 생성 (품질 모델)
        const content = await this.generateContent(
            `다음 개요를 바탕으로 완전한 블로그 포스트를 작성해주세요:
            ${outline}
            
            스타일: ${style}
            길이: 2000자 이상
            톤: 전문적이면서 읽기 쉽게`,
            { mode: 'quality', maxTokens: 4096 }
        );
        
        // 3단계: SEO 최적화 (빠른 모델)
        const seo = await this.generateContent(
            `다음 콘텐츠에 대한 SEO 최적화를 수행해주세요:
            - 매력적인 제목 3개
            - 메타 설명
            - 핵심 키워드 10개
            
            콘텐츠: ${content.substring(0, 1000)}...`,
            { mode: 'speed' }
        );
        
        return {
            outline,
            content,
            seo,
            metadata: {
                model: 'Mixed Mode',
                timestamp: new Date().toISOString()
            }
        };
    }
    
    // 간단한 프롬프트 템플릿
    getPrompt(type, variables = {}) {
        const templates = {
            blog: `주제: ${variables.topic}
                  타겟 독자: ${variables.audience || '일반 독자'}
                  
                  위 주제로 블로그 포스트를 작성해주세요.
                  - 매력적인 제목
                  - 서론 (문제 제기)
                  - 본론 (3-4개 섹션)
                  - 실용적인 팁
                  - 결론`,
            
            title: `"${variables.content?.substring(0, 500)}..."
                   위 내용에 대한 매력적인 블로그 제목 5개를 제안해주세요.`,
            
            seo: `다음 콘텐츠의 SEO를 최적화해주세요:
                 ${variables.content?.substring(0, 1000)}`,
            
            summary: `다음 내용을 150자로 요약해주세요:
                     ${variables.content}`
        };
        
        return templates[type] || '';
    }
}

// 전역 인스턴스 생성
window.simpleAI = new SimpleAIManager();