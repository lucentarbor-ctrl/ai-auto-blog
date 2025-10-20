// 다중 AI 모델 관리 시스템
class MultiAIManager {
    constructor() {
        // API 키 설정
        this.apiKeys = {
            gemini: 'AIzaSyAmLSwyMGCkDpSojwPjQwTnYmlAQjrdH7g',
            // 나중에 추가할 API 키들
            openai: null,
            anthropic: null,
            cohere: null
        };
        
        // 사용 가능한 모델들
        this.models = {
            'gemini-flash': {
                id: 'gemini-flash',
                name: 'Gemini 2.5 Flash',
                provider: 'Google',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
                apiKey: this.apiKeys.gemini,
                cost: 0, // 무료
                speed: 'fast',
                quality: 'good',
                maxTokens: 8192,
                features: ['text', 'vision', 'code'],
                rateLimit: 1500, // 일일 한도
                enabled: true
            },
            'gemini-pro': {
                id: 'gemini-pro',
                name: 'Gemini 2.5 Pro',
                provider: 'Google',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
                apiKey: this.apiKeys.gemini,
                cost: 0, // 무료 쿼터
                speed: 'medium',
                quality: 'excellent',
                maxTokens: 32768,
                features: ['text', 'vision', 'code', 'long-context'],
                rateLimit: 50, // 일일 한도
                enabled: true
            },
            // Ollama 로컬 모델
            'ollama-deepseek-local': {
                id: 'ollama-deepseek-local',
                name: 'DeepSeek Coder 16B (Local)',
                provider: 'Ollama',
                endpoint: 'http://localhost:11434/api/chat',
                model: 'deepseek-coder-v2:16b',
                cost: 0,
                speed: 'medium',
                quality: 'good',
                maxTokens: 32768,
                features: ['text', 'code'],
                rateLimit: Infinity,
                enabled: false,
                requiresSetup: false
            },
            'ollama-qwen-local': {
                id: 'ollama-qwen-local',
                name: 'Qwen3 Coder 30B (Local)',
                provider: 'Ollama',
                endpoint: 'http://localhost:11434/api/chat',
                model: 'qwen3-coder:30b',
                cost: 0,
                speed: 'slow',
                quality: 'very-good',
                maxTokens: 32768,
                features: ['text', 'code', 'multilingual'],
                rateLimit: Infinity,
                enabled: false,
                requiresSetup: false
            },
            
            // Ollama 클라우드 모델
            'ollama-glm-cloud': {
                id: 'ollama-glm-cloud',
                name: 'GLM-4.6 355B (Cloud)',
                provider: 'Ollama Cloud',
                endpoint: 'http://localhost:11434/api/chat',
                model: 'glm-4.6:cloud',
                cost: 0, // 프리뷰 무료
                speed: 'fast',
                quality: 'excellent',
                maxTokens: 202752,
                features: ['text', 'code', 'reasoning', 'tools', 'thinking'],
                rateLimit: 100, // 시간당 추정
                enabled: false,
                requiresSetup: false,
                isCloud: true
            },
            'ollama-deepseek-cloud': {
                id: 'ollama-deepseek-cloud',
                name: 'DeepSeek v3.1 671B (Cloud)',
                provider: 'Ollama Cloud',
                endpoint: 'http://localhost:11434/api/chat',
                model: 'deepseek-v3.1:671b-cloud',
                cost: 0, // 프리뷰 무료
                speed: 'fast',
                quality: 'state-of-the-art',
                maxTokens: 163840,
                features: ['text', 'code', 'reasoning', 'tools', 'thinking'],
                rateLimit: 100, // 시간당 추정
                enabled: false,
                requiresSetup: false,
                isCloud: true
            },
            'ollama-qwen-cloud': {
                id: 'ollama-qwen-cloud',
                name: 'Qwen3 Coder 480B (Cloud)',
                provider: 'Ollama Cloud',
                endpoint: 'http://localhost:11434/api/chat',
                model: 'qwen3-coder:480b-cloud',
                cost: 0, // 프리뷰 무료
                speed: 'fast',
                quality: 'excellent',
                maxTokens: 131072,
                features: ['text', 'code', 'multilingual', 'advanced-coding'],
                rateLimit: 100, // 시간당 추정
                enabled: false,
                requiresSetup: false,
                isCloud: true
            }
        };
        
        // 사용 통계
        this.stats = this.loadStats();
        
        // 모델 상태 체크
        this.checkModelsAvailability();
    }
    
    // 모델 가용성 체크
    async checkModelsAvailability() {
        // Ollama 체크
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            if (response.ok) {
                const data = await response.json();
                const models = data.models || [];
                
                // 로컬 모델 체크
                if (models.find(m => m.name.includes('deepseek-coder-v2:16b'))) {
                    this.models['ollama-deepseek-local'].enabled = true;
                }
                if (models.find(m => m.name.includes('qwen3-coder:30b'))) {
                    this.models['ollama-qwen-local'].enabled = true;
                }
                
                // 클라우드 모델 체크
                if (models.find(m => m.name.includes('glm-4.6:cloud'))) {
                    this.models['ollama-glm-cloud'].enabled = true;
                }
                if (models.find(m => m.name.includes('deepseek-v3.1:671b-cloud'))) {
                    this.models['ollama-deepseek-cloud'].enabled = true;
                }
                if (models.find(m => m.name.includes('qwen3-coder:480b-cloud'))) {
                    this.models['ollama-qwen-cloud'].enabled = true;
                }
                
                console.log('✅ Ollama 모델 감지:', models.map(m => m.name));
            }
        } catch (e) {
            console.log('ℹ️ Ollama 미설치 또는 미실행');
        }
        
        // Gemini API 체크
        if (this.apiKeys.gemini) {
            try {
                const testPrompt = 'Hello';
                await this.callGeminiAPI(testPrompt, this.models['gemini-flash'], 10);
                console.log('✅ Gemini API 연결 성공');
            } catch (e) {
                console.warn('⚠️ Gemini API 연결 실패:', e.message);
                this.models['gemini-flash'].enabled = false;
                this.models['gemini-pro'].enabled = false;
            }
        }
    }
    
    // 최적 모델 선택 (자동)
    selectBestModel(requirements = {}) {
        const {
            priority = 'balanced', // speed, quality, cost, balanced
            minQuality = 'medium',
            maxCost = Infinity,
            requiredFeatures = [],
            preferLocal = false
        } = requirements;
        
        // 활성화된 모델 필터링
        let availableModels = Object.values(this.models)
            .filter(m => m.enabled)
            .filter(m => m.cost <= maxCost);
        
        // 필수 기능 필터링
        if (requiredFeatures.length > 0) {
            availableModels = availableModels.filter(m => 
                requiredFeatures.every(f => m.features.includes(f))
            );
        }
        
        // 로컬 선호 옵션
        if (preferLocal) {
            const localModels = availableModels.filter(m => m.provider === 'Ollama');
            if (localModels.length > 0) availableModels = localModels;
        }
        
        // 우선순위별 정렬
        switch(priority) {
            case 'speed':
                availableModels.sort((a, b) => {
                    const speedOrder = {'fast': 0, 'medium': 1, 'slow': 2};
                    return speedOrder[a.speed] - speedOrder[b.speed];
                });
                break;
            case 'quality':
                availableModels.sort((a, b) => {
                    const qualityOrder = {'excellent': 0, 'good': 1, 'medium': 2};
                    return qualityOrder[a.quality] - qualityOrder[b.quality];
                });
                break;
            case 'cost':
                availableModels.sort((a, b) => a.cost - b.cost);
                break;
            default: // balanced
                // 균형잡힌 점수 계산
                availableModels.sort((a, b) => {
                    const scoreA = this.calculateBalanceScore(a);
                    const scoreB = this.calculateBalanceScore(b);
                    return scoreB - scoreA;
                });
        }
        
        return availableModels[0] || null;
    }
    
    // 균형 점수 계산
    calculateBalanceScore(model) {
        const speedScore = {'fast': 3, 'medium': 2, 'slow': 1}[model.speed];
        const qualityScore = {'excellent': 3, 'good': 2, 'medium': 1}[model.quality];
        const costScore = model.cost === 0 ? 3 : (model.cost < 0.001 ? 2 : 1);
        
        return speedScore + qualityScore * 1.5 + costScore * 0.5;
    }
    
    // 콘텐츠 생성 (자동 모델 선택)
    async generateContent(prompt, options = {}) {
        const {
            modelId = null,
            autoSelect = true,
            requirements = {},
            temperature = 0.7,
            maxTokens = null
        } = options;
        
        let model;
        
        if (modelId && this.models[modelId]) {
            model = this.models[modelId];
        } else if (autoSelect) {
            model = this.selectBestModel(requirements);
        }
        
        if (!model || !model.enabled) {
            throw new Error('사용 가능한 모델이 없습니다');
        }
        
        console.log(`🤖 선택된 모델: ${model.name}`);
        
        // 통계 시작
        const startTime = Date.now();
        
        try {
            let result;
            
            // 프로바이더별 API 호출
            switch(model.provider) {
                case 'Google':
                    result = await this.callGeminiAPI(prompt, model, maxTokens || model.maxTokens, temperature);
                    break;
                case 'Ollama':
                case 'Ollama Cloud':
                    result = await this.callOllamaAPI(prompt, model);
                    break;
                default:
                    throw new Error(`지원하지 않는 프로바이더: ${model.provider}`);
            }
            
            // 통계 업데이트
            const duration = Date.now() - startTime;
            this.updateStats(model.id, {
                success: true,
                duration,
                tokens: result.length,
                cost: model.cost * (result.length / 1000)
            });
            
            return {
                content: result,
                model: model.name,
                modelId: model.id,
                duration,
                cost: model.cost * (result.length / 1000)
            };
            
        } catch (error) {
            // 오류 통계
            this.updateStats(model.id, {
                success: false,
                error: error.message
            });
            
            // 폴백 모델 시도
            if (autoSelect && model.id !== 'gemini-flash') {
                console.log('🔄 폴백 모델로 재시도...');
                return this.generateContent(prompt, {
                    ...options,
                    modelId: 'gemini-flash'
                });
            }
            
            throw error;
        }
    }
    
    // Gemini API 호출
    async callGeminiAPI(prompt, model, maxTokens, temperature) {
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
                    topP: 0.95,
                    topK: 40
                }
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API 오류');
        }
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    
    // Ollama API 호출
    async callOllamaAPI(prompt, model) {
        // chat API 사용 (클라우드 모델 지원)
        const response = await fetch(model.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model.model,
                messages: [
                    { role: 'user', content: prompt }
                ],
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.95
                }
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Ollama API 오류: ${error}`);
        }
        
        const data = await response.json();
        return data.message?.content || data.response || '';
    }
    
    // 병렬 생성 (여러 모델 동시 실행)
    async generateParallel(prompt, modelIds = []) {
        const promises = modelIds.map(id => 
            this.generateContent(prompt, { modelId: id, autoSelect: false })
                .catch(err => ({ error: err.message, modelId: id }))
        );
        
        const results = await Promise.all(promises);
        return results;
    }
    
    // A/B 테스트
    async abTest(prompt, modelA, modelB) {
        const [resultA, resultB] = await Promise.all([
            this.generateContent(prompt, { modelId: modelA }),
            this.generateContent(prompt, { modelId: modelB })
        ]);
        
        return {
            modelA: { ...resultA, score: 0 },
            modelB: { ...resultB, score: 0 },
            prompt
        };
    }
    
    // 통계 업데이트
    updateStats(modelId, data) {
        if (!this.stats[modelId]) {
            this.stats[modelId] = {
                totalCalls: 0,
                successCalls: 0,
                totalDuration: 0,
                totalTokens: 0,
                totalCost: 0,
                errors: 0,
                lastUsed: null
            };
        }
        
        const stat = this.stats[modelId];
        stat.totalCalls++;
        stat.lastUsed = new Date().toISOString();
        
        if (data.success) {
            stat.successCalls++;
            stat.totalDuration += data.duration || 0;
            stat.totalTokens += data.tokens || 0;
            stat.totalCost += data.cost || 0;
        } else {
            stat.errors++;
        }
        
        this.saveStats();
    }
    
    // 통계 저장
    saveStats() {
        localStorage.setItem('ai_model_stats', JSON.stringify(this.stats));
    }
    
    // 통계 불러오기
    loadStats() {
        try {
            return JSON.parse(localStorage.getItem('ai_model_stats') || '{}');
        } catch {
            return {};
        }
    }
    
    // 모델별 성능 리포트
    getPerformanceReport() {
        const report = {};
        
        Object.entries(this.stats).forEach(([modelId, stat]) => {
            const model = this.models[modelId];
            if (!model) return;
            
            report[modelId] = {
                name: model.name,
                provider: model.provider,
                totalCalls: stat.totalCalls,
                successRate: stat.totalCalls > 0 ? 
                    (stat.successCalls / stat.totalCalls * 100).toFixed(1) + '%' : 'N/A',
                avgDuration: stat.successCalls > 0 ?
                    Math.round(stat.totalDuration / stat.successCalls) + 'ms' : 'N/A',
                avgTokens: stat.successCalls > 0 ?
                    Math.round(stat.totalTokens / stat.successCalls) : 'N/A',
                totalCost: '$' + stat.totalCost.toFixed(4),
                lastUsed: stat.lastUsed ? new Date(stat.lastUsed).toLocaleString() : 'Never'
            };
        });
        
        return report;
    }
    
    // 모델 추가 준비 (나중에 유료 모델용)
    prepareModelAddition(provider, apiKey) {
        const templates = {
            openai: {
                'gpt-4o': {
                    id: 'gpt-4o',
                    name: 'GPT-4o',
                    provider: 'OpenAI',
                    endpoint: 'https://api.openai.com/v1/chat/completions',
                    apiKey: apiKey,
                    cost: 0.005, // $0.005 per 1K tokens
                    speed: 'fast',
                    quality: 'excellent',
                    maxTokens: 128000,
                    features: ['text', 'vision', 'code', 'function-calling'],
                    enabled: false
                },
                'gpt-4o-mini': {
                    id: 'gpt-4o-mini',
                    name: 'GPT-4o Mini',
                    provider: 'OpenAI',
                    endpoint: 'https://api.openai.com/v1/chat/completions',
                    apiKey: apiKey,
                    cost: 0.00015,
                    speed: 'very-fast',
                    quality: 'good',
                    maxTokens: 128000,
                    features: ['text', 'code', 'function-calling'],
                    enabled: false
                }
            },
            anthropic: {
                'claude-3-5-sonnet': {
                    id: 'claude-3-5-sonnet',
                    name: 'Claude 3.5 Sonnet',
                    provider: 'Anthropic',
                    endpoint: 'https://api.anthropic.com/v1/messages',
                    apiKey: apiKey,
                    cost: 0.003,
                    speed: 'medium',
                    quality: 'excellent',
                    maxTokens: 200000,
                    features: ['text', 'vision', 'code', 'long-context'],
                    enabled: false
                }
            }
        };
        
        return templates[provider] || {};
    }
}

// 전역 인스턴스 생성
window.multiAI = new MultiAIManager();