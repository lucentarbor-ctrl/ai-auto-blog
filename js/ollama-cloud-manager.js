// Ollama 클라우드 모델 관리자
class OllamaCloudManager {
    constructor() {
        this.baseUrl = 'http://localhost:11434';
        this.models = {
            // 로컬 모델
            'deepseek-coder-local': {
                id: 'deepseek-coder-local',
                name: 'DeepSeek Coder v2 16B (Local)',
                model: 'deepseek-coder-v2:16b',
                type: 'local',
                provider: 'Ollama',
                parameters: '16B',
                context: 32768,
                speed: 'medium',
                quality: 'good',
                speciality: 'coding',
                cost: 0,
                enabled: true
            },
            'qwen-coder-local': {
                id: 'qwen-coder-local',
                name: 'Qwen3 Coder 30B (Local)',
                model: 'qwen3-coder:30b',
                type: 'local',
                provider: 'Ollama',
                parameters: '30B',
                context: 32768,
                speed: 'slow',
                quality: 'very-good',
                speciality: 'coding',
                cost: 0,
                enabled: true
            },
            
            // 클라우드 모델
            'glm-4.6-cloud': {
                id: 'glm-4.6-cloud',
                name: 'GLM-4.6 Cloud',
                model: 'glm-4.6:cloud',
                type: 'cloud',
                provider: 'Ollama Cloud',
                parameters: '355B',
                context: 202752,
                speed: 'fast',
                quality: 'excellent',
                speciality: 'general, reasoning, coding',
                capabilities: ['completion', 'tools', 'thinking'],
                cost: 0, // 프리뷰 기간 무료
                quotaLimit: true,
                enabled: true
            },
            'deepseek-v3.1-cloud': {
                id: 'deepseek-v3.1-cloud',
                name: 'DeepSeek v3.1 671B Cloud',
                model: 'deepseek-v3.1:671b-cloud',
                type: 'cloud',
                provider: 'Ollama Cloud',
                parameters: '671B',
                context: 163840,
                speed: 'fast',
                quality: 'state-of-the-art',
                speciality: 'general, reasoning, coding',
                capabilities: ['completion', 'tools', 'thinking'],
                cost: 0, // 프리뷰 기간 무료
                quotaLimit: true,
                enabled: true
            },
            'qwen3-coder-cloud': {
                id: 'qwen3-coder-cloud',
                name: 'Qwen3 Coder 480B Cloud',
                model: 'qwen3-coder:480b-cloud',
                type: 'cloud',
                provider: 'Ollama Cloud',
                parameters: '480B',
                context: 131072,
                speed: 'fast',
                quality: 'excellent',
                speciality: 'advanced coding',
                cost: 0, // 프리뷰 기간 무료
                quotaLimit: true,
                enabled: true
            }
        };
        
        this.quotaStatus = {
            hourlyUsed: 0,
            hourlyLimit: 100, // 추정치
            dailyUsed: 0,
            dailyLimit: 1000, // 추정치
            lastReset: new Date()
        };
        
        this.checkAvailability();
    }
    
    // 모델 가용성 체크
    async checkAvailability() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (response.ok) {
                const data = await response.json();
                const availableModels = data.models || [];
                
                // 설치된 모델 확인
                Object.values(this.models).forEach(model => {
                    const isAvailable = availableModels.some(m => 
                        m.name === model.model || m.name.includes(model.model.split(':')[0])
                    );
                    model.available = isAvailable;
                    
                    if (isAvailable) {
                        console.log(`✓ ${model.name} 사용 가능`);
                    }
                });
                
                // 클라우드 모델 인증 체크
                await this.checkCloudAuth();
            }
        } catch (error) {
            console.error('Ollama 연결 실패:', error);
        }
    }
    
    // 클라우드 인증 상태 체크
    async checkCloudAuth() {
        // 실제로는 ollama signin 필요
        // 간단한 테스트로 클라우드 모델 호출 시도
        try {
            const testResponse = await this.generate(
                'Hello', 
                { modelId: 'glm-4.6-cloud', maxTokens: 10 }
            );
            
            if (testResponse) {
                console.log('✓ Ollama Cloud 인증됨');
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Ollama Cloud 인증 필요: ollama signin');
            return false;
        }
    }
    
    // 콘텐츠 생성
    async generate(prompt, options = {}) {
        const {
            modelId = 'glm-4.6-cloud',
            temperature = 0.7,
            maxTokens = 2048,
            stream = false,
            tools = null,
            systemPrompt = null
        } = options;
        
        const model = this.models[modelId];
        if (!model || !model.available) {
            throw new Error(`모델 ${modelId}를 사용할 수 없습니다`);
        }
        
        // 쿼터 체크 (클라우드 모델)
        if (model.type === 'cloud' && model.quotaLimit) {
            if (!this.checkQuota()) {
                throw new Error('클라우드 모델 쿼터 초과. 나중에 다시 시도하세요.');
            }
        }
        
        const startTime = Date.now();
        
        try {
            const messages = [];
            
            // 시스템 프롬프트 추가
            if (systemPrompt) {
                messages.push({
                    role: 'system',
                    content: systemPrompt
                });
            }
            
            messages.push({
                role: 'user',
                content: prompt
            });
            
            const requestBody = {
                model: model.model,
                messages,
                stream,
                options: {
                    temperature,
                    num_predict: maxTokens,
                    top_p: 0.95,
                    top_k: 40
                }
            };
            
            // 도구 사용 (클라우드 모델만)
            if (tools && model.capabilities?.includes('tools')) {
                requestBody.tools = tools;
            }
            
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }
            
            const data = await response.json();
            const duration = Date.now() - startTime;
            
            // 쿼터 업데이트
            if (model.type === 'cloud') {
                this.updateQuota(data.eval_count || maxTokens);
            }
            
            return {
                content: data.message.content,
                model: model.name,
                modelId: model.id,
                duration,
                tokens: data.eval_count || 0,
                promptTokens: data.prompt_eval_count || 0,
                totalTokens: (data.eval_count || 0) + (data.prompt_eval_count || 0),
                cost: 0, // 현재 무료
                metadata: {
                    type: model.type,
                    parameters: model.parameters,
                    context: model.context
                }
            };
            
        } catch (error) {
            console.error(`${model.name} 오류:`, error);
            
            // 클라우드 모델 실패 시 로컬 폴백
            if (model.type === 'cloud' && options.fallback !== false) {
                console.log('로컬 모델로 폴백...');
                return this.generate(prompt, {
                    ...options,
                    modelId: 'deepseek-coder-local',
                    fallback: false
                });
            }
            
            throw error;
        }
    }
    
    // 스트리밍 생성
    async *generateStream(prompt, options = {}) {
        const {
            modelId = 'glm-4.6-cloud',
            temperature = 0.7,
            maxTokens = 2048
        } = options;
        
        const model = this.models[modelId];
        if (!model) throw new Error(`모델 ${modelId}를 찾을 수 없습니다`);
        
        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model.model,
                prompt,
                stream: true,
                options: {
                    temperature,
                    num_predict: maxTokens
                }
            })
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
                try {
                    const data = JSON.parse(line);
                    if (data.response) {
                        yield data.response;
                    }
                } catch (e) {
                    // 파싱 오류 무시
                }
            }
        }
    }
    
    // 코드 생성 특화
    async generateCode(prompt, language = 'javascript', options = {}) {
        const codingModels = Object.values(this.models)
            .filter(m => m.speciality.includes('coding') && m.available)
            .sort((a, b) => {
                // 품질 우선 정렬
                const qualityOrder = {
                    'state-of-the-art': 0,
                    'excellent': 1,
                    'very-good': 2,
                    'good': 3
                };
                return qualityOrder[a.quality] - qualityOrder[b.quality];
            });
        
        if (codingModels.length === 0) {
            throw new Error('사용 가능한 코딩 모델이 없습니다');
        }
        
        const model = options.preferCloud ? 
            codingModels.find(m => m.type === 'cloud') || codingModels[0] :
            codingModels[0];
        
        const systemPrompt = `You are an expert ${language} developer. 
Generate clean, efficient, and well-commented code.
Follow best practices and modern conventions.`;
        
        return this.generate(prompt, {
            ...options,
            modelId: model.id,
            systemPrompt,
            temperature: 0.3 // 코드 생성은 낮은 temperature
        });
    }
    
    // 쿼터 관리
    checkQuota() {
        const now = new Date();
        const hourDiff = (now - this.quotaStatus.lastReset) / (1000 * 60 * 60);
        
        // 1시간 지났으면 리셋
        if (hourDiff >= 1) {
            this.quotaStatus.hourlyUsed = 0;
            this.quotaStatus.lastReset = now;
            
            // 24시간 지났으면 일일 리셋
            if (hourDiff >= 24) {
                this.quotaStatus.dailyUsed = 0;
            }
        }
        
        return this.quotaStatus.hourlyUsed < this.quotaStatus.hourlyLimit &&
               this.quotaStatus.dailyUsed < this.quotaStatus.dailyLimit;
    }
    
    updateQuota(tokensUsed) {
        // 토큰 기반 쿼터 추정 (1000 토큰 = 1 요청으로 계산)
        const requests = Math.ceil(tokensUsed / 1000);
        this.quotaStatus.hourlyUsed += requests;
        this.quotaStatus.dailyUsed += requests;
    }
    
    // 모델 비교
    async compareModels(prompt, modelIds = null) {
        const modelsToCompare = modelIds ? 
            modelIds.map(id => this.models[id]).filter(Boolean) :
            Object.values(this.models).filter(m => m.available);
        
        const results = await Promise.allSettled(
            modelsToCompare.map(model => 
                this.generate(prompt, { 
                    modelId: model.id,
                    maxTokens: 1000,
                    fallback: false 
                })
            )
        );
        
        return results.map((result, index) => {
            const model = modelsToCompare[index];
            if (result.status === 'fulfilled') {
                return {
                    ...result.value,
                    success: true
                };
            } else {
                return {
                    model: model.name,
                    modelId: model.id,
                    error: result.reason.message,
                    success: false
                };
            }
        });
    }
    
    // 최적 모델 선택
    selectBestModel(requirements = {}) {
        const {
            task = 'general', // general, coding, reasoning
            preferCloud = true,
            maxLatency = 5000,
            minQuality = 'good'
        } = requirements;
        
        const qualityOrder = {
            'state-of-the-art': 4,
            'excellent': 3,
            'very-good': 2,
            'good': 1
        };
        
        const candidates = Object.values(this.models)
            .filter(m => {
                if (!m.available) return false;
                if (qualityOrder[m.quality] < qualityOrder[minQuality]) return false;
                if (!m.speciality.includes(task) && task !== 'general') return false;
                return true;
            })
            .sort((a, b) => {
                // 클라우드 선호도
                if (preferCloud && a.type !== b.type) {
                    return a.type === 'cloud' ? -1 : 1;
                }
                // 품질 우선
                return qualityOrder[b.quality] - qualityOrder[a.quality];
            });
        
        return candidates[0] || null;
    }
    
    // 상태 리포트
    getStatusReport() {
        const report = {
            localModels: [],
            cloudModels: [],
            quotaStatus: this.quotaStatus,
            recommendations: []
        };
        
        Object.values(this.models).forEach(model => {
            const info = {
                name: model.name,
                parameters: model.parameters,
                available: model.available,
                type: model.type,
                quality: model.quality
            };
            
            if (model.type === 'local') {
                report.localModels.push(info);
            } else {
                report.cloudModels.push(info);
            }
        });
        
        // 추천사항
        if (report.cloudModels.some(m => m.available)) {
            report.recommendations.push('클라우드 모델 사용 가능 - 고품질 응답에 활용하세요');
        }
        
        if (report.localModels.some(m => m.available)) {
            report.recommendations.push('로컬 모델 사용 가능 - 민감한 데이터 처리에 활용하세요');
        }
        
        if (this.quotaStatus.hourlyUsed > this.quotaStatus.hourlyLimit * 0.8) {
            report.recommendations.push('클라우드 쿼터 80% 초과 - 로컬 모델 사용을 고려하세요');
        }
        
        return report;
    }
}

// 전역 인스턴스
window.ollamaCloud = new OllamaCloudManager();