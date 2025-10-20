// 7개 AI 모델 통합 시스템
class MultiModelIntegration {
    constructor() {
        this.models = {
            'gemini-flash': {
                id: 'gemini-2.5-flash',
                name: 'Gemini Flash',
                type: 'gemini',
                apiKey: 'AIzaSyAmLSwyMGCkDpSojwPjQwTnYmlAQjrdH7g',
                active: true
            },
            'gemini-pro': {
                id: 'gemini-2.5-pro',
                name: 'Gemini Pro',
                type: 'gemini',
                apiKey: 'AIzaSyAmLSwyMGCkDpSojwPjQwTnYmlAQjrdH7g',
                active: true
            },
            'glm': {
                id: 'glm-4.6:cloud',
                name: 'GLM-4.6 (355B)',
                type: 'ollama',
                active: true
            },
            'deepseek': {
                id: 'deepseek-v3.1:671b-cloud',
                name: 'DeepSeek (671B)',
                type: 'ollama',
                active: true
            },
            'qwen': {
                id: 'qwen3-coder:480b-cloud',
                name: 'Qwen3 (480B)',
                type: 'ollama',
                active: true
            },
            'gpt-oss': {
                id: 'gpt-oss:120b-cloud',
                name: 'GPT-OSS (120B)',
                type: 'ollama',
                active: true
            },
            'kimi': {
                id: 'kimi-k2:1t-cloud',
                name: 'Kimi K2 (1T)',
                type: 'ollama',
                active: true
            }
        };
        
        this.results = {};
        this.isGenerating = false;
    }
    
    // 7개 모델 동시 생성
    async generateAll(topic, options = {}) {
        if (this.isGenerating) {
            console.log('이미 생성 중입니다');
            return;
        }
        
        this.isGenerating = true;
        this.results = {};
        
        const {
            contentType = 'blog',
            length = 500,
            style = 'professional',
            additionalPrompt = ''
        } = options;
        
        // 프롬프트 구성
        const prompt = this.buildPrompt(topic, contentType, length, style, additionalPrompt);
        
        // UI 업데이트 콜백
        if (options.onStart) options.onStart();
        
        // 활성 모델만 필터링
        const activeModels = Object.entries(this.models).filter(([_, m]) => m.active);
        
        // 병렬 실행
        const promises = activeModels.map(async ([key, model]) => {
            try {
                if (options.onModelStart) options.onModelStart(key);
                
                const startTime = Date.now();
                let content;
                
                if (model.type === 'gemini') {
                    content = await this.callGemini(model, prompt);
                } else {
                    content = await this.callOllama(model, prompt);
                }
                
                this.results[key] = {
                    content,
                    model: model.name,
                    duration: Date.now() - startTime,
                    tokens: content.length,
                    success: true
                };
                
                if (options.onModelComplete) {
                    options.onModelComplete(key, this.results[key]);
                }
                
            } catch (error) {
                console.error(`${model.name} 오류:`, error);
                
                this.results[key] = {
                    error: error.message,
                    model: model.name,
                    success: false
                };
                
                if (options.onModelError) {
                    options.onModelError(key, error);
                }
            }
        });
        
        await Promise.allSettled(promises);
        
        this.isGenerating = false;
        
        if (options.onComplete) {
            options.onComplete(this.results);
        }
        
        return this.results;
    }
    
    // 프롬프트 구성
    buildPrompt(topic, contentType, length, style, additional) {
        const typeMap = {
            blog: '블로그 포스트',
            article: '기사',
            tutorial: '튜토리얼',
            review: '리뷰'
        };
        
        const styleMap = {
            professional: '전문적이고 신뢰성 있는',
            casual: '캐주얼하고 친근한',
            academic: '학술적이고 엄격한',
            creative: '창의적이고 독특한'
        };
        
        return `
주제: ${topic}
형식: ${typeMap[contentType] || contentType}
길이: 약 ${length}자
스타일: ${styleMap[style] || style} 톤

${additional ? `추가 요구사항: ${additional}` : ''}

위 조건에 맞춰 한국어로 콘텐츠를 작성해주세요.
구조화된 내용으로 작성하며, 도입부-본론-결론의 형식을 갖춰주세요.
        `.trim();
    }
    
    // Gemini API 호출
    async callGemini(model, prompt) {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${model.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 2000,
                        topP: 0.95
                    }
                })
            }
        );
        
        if (!response.ok) throw new Error(`Gemini API 오류: ${response.status}`);
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    
    // Ollama API 호출
    async callOllama(model, prompt) {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model.id,
                messages: [
                    { role: 'user', content: prompt }
                ],
                stream: false,
                options: {
                    temperature: 0.8,
                    num_predict: 2000
                }
            })
        });
        
        if (!response.ok) throw new Error(`Ollama API 오류: ${response.status}`);
        
        const data = await response.json();
        return data.message?.content || '';
    }
    
    // Gemini로 통합 정리
    async mixWithGemini(selectedKeys = null) {
        const successfulResults = Object.entries(this.results)
            .filter(([key, result]) => {
                if (selectedKeys && !selectedKeys.includes(key)) return false;
                return result.success;
            });
        
        if (successfulResults.length === 0) {
            throw new Error('통합할 콘텐츠가 없습니다');
        }
        
        // 각 모델의 결과를 합쳐서 프롬프트 생성
        const combinedContent = successfulResults
            .map(([key, result]) => `
[${this.models[key].name}의 콘텐츠]:
${result.content}
            `).join('\n---\n');
        
        const mixPrompt = `
다음은 여러 AI 모델이 같은 주제로 작성한 콘텐츠들입니다.
이들을 참고하여 가장 좋은 부분들을 선별하고 통합하여 하나의 완성도 높은 콘텐츠로 재구성해주세요.

통합 원칙:
1. 각 모델의 장점을 살려 통합
2. 중복 내용 제거 및 일관성 유지
3. 논리적 흐름과 구조 개선
4. 읽기 쉽고 자연스러운 문체로 통일
5. 핵심 정보는 모두 포함

---
${combinedContent}
---

위 내용들을 통합하여 하나의 완성도 높은 콘텐츠로 작성해주세요.
        `;
        
        // Gemini Pro로 통합 (더 나은 품질)
        const geminiPro = this.models['gemini-pro'];
        const mixedContent = await this.callGemini(geminiPro, mixPrompt);
        
        return {
            content: mixedContent,
            sources: successfulResults.map(([key]) => this.models[key].name),
            timestamp: new Date().toISOString()
        };
    }
    
    // 최고 품질 콘텐츠 선택
    selectBest() {
        const successfulResults = Object.entries(this.results)
            .filter(([_, r]) => r.success);
        
        if (successfulResults.length === 0) return null;
        
        // 품질 점수 계산 (간단한 휴리스틱)
        const scored = successfulResults.map(([key, result]) => {
            let score = 0;
            
            // 길이 점수
            if (result.tokens > 300) score += 30;
            if (result.tokens > 500) score += 20;
            if (result.tokens > 1000) score += 10;
            
            // 구조 점수
            if (result.content.includes('\n\n')) score += 20;
            if (result.content.split('\n').length > 3) score += 10;
            
            // 한글 완성도
            if (result.content.match(/[가-힣]/g)?.length > 100) score += 20;
            
            // 속도 보너스
            if (result.duration < 3000) score += 10;
            
            return { key, score, result };
        });
        
        // 최고 점수 선택
        scored.sort((a, b) => b.score - a.score);
        return scored[0];
    }
    
    // 모델 활성화/비활성화
    toggleModel(modelKey) {
        if (this.models[modelKey]) {
            this.models[modelKey].active = !this.models[modelKey].active;
            return this.models[modelKey].active;
        }
        return false;
    }
    
    // 통계 정보
    getStatistics() {
        const stats = {
            totalModels: Object.keys(this.models).length,
            activeModels: Object.values(this.models).filter(m => m.active).length,
            successCount: Object.values(this.results).filter(r => r.success).length,
            errorCount: Object.values(this.results).filter(r => !r.success).length,
            avgDuration: 0,
            avgTokens: 0
        };
        
        const successful = Object.values(this.results).filter(r => r.success);
        if (successful.length > 0) {
            stats.avgDuration = Math.round(
                successful.reduce((sum, r) => sum + r.duration, 0) / successful.length
            );
            stats.avgTokens = Math.round(
                successful.reduce((sum, r) => sum + r.tokens, 0) / successful.length
            );
        }
        
        return stats;
    }
}

// 전역 인스턴스 생성
window.multiModelIntegration = new MultiModelIntegration();