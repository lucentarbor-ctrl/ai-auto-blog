// Ollama Cloud Direct API Manager
// ollama.com API에 직접 접근하는 방식

class OllamaDirectAPI {
    constructor(apiKey = null) {
        // API 키가 필요한 경우 ollama.com 설정에서 생성
        this.apiKey = apiKey || process.env.OLLAMA_API_KEY;
        this.baseUrl = 'https://ollama.com/api';
        
        // 로컬 Ollama 경유 (현재 방식)
        this.localUrl = 'http://localhost:11434/api';
        
        this.models = {
            'deepseek-v3.1:671b-cloud': {
                name: 'DeepSeek v3.1 671B',
                parameters: '671B',
                context: 163840
            },
            'gpt-oss:120b-cloud': {
                name: 'GPT-OSS 120B',
                parameters: '120B',
                context: 128000
            },
            'kimi-k2:1t-cloud': {
                name: 'Kimi K2 1T',
                parameters: '1T',
                context: 200000
            },
            'qwen3-coder:480b-cloud': {
                name: 'Qwen3 Coder 480B',
                parameters: '480B',
                context: 131072
            },
            'glm-4.6:cloud': {
                name: 'GLM-4.6 355B',
                parameters: '355B',
                context: 202752
            }
        };
    }
    
    // 직접 API 호출 (API 키 필요)
    async directAPICall(prompt, model = 'glm-4.6:cloud') {
        if (!this.apiKey) {
            throw new Error('Ollama API 키가 필요합니다. ollama.com에서 생성하세요.');
        }
        
        const response = await fetch(`${this.baseUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'user', content: prompt }
                ],
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }
        
        const data = await response.json();
        return data.message?.content;
    }
    
    // 로컬 Ollama 경유 (로그인만 필요)
    async localAPICall(prompt, model = 'glm-4.6:cloud') {
        const response = await fetch(`${this.localUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'user', content: prompt }
                ],
                stream: false
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`로컬 API 오류: ${error}`);
        }
        
        const data = await response.json();
        return data.message?.content;
    }
    
    // 모델 목록 가져오기 (직접 API)
    async listModelsFromAPI() {
        if (!this.apiKey) {
            throw new Error('API 키가 필요합니다');
        }
        
        const response = await fetch(`${this.baseUrl}/tags`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        
        const data = await response.json();
        return data.models;
    }
    
    // 모델 목록 가져오기 (로컬)
    async listModelsLocal() {
        const response = await fetch(`${this.localUrl}/tags`);
        const data = await response.json();
        return data.models;
    }
    
    // 스트리밍 생성
    async* streamGenerate(prompt, model = 'glm-4.6:cloud', useDirectAPI = false) {
        const url = useDirectAPI ? this.baseUrl : this.localUrl;
        const headers = useDirectAPI && this.apiKey ? 
            {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            } : 
            { 'Content-Type': 'application/json' };
        
        const response = await fetch(`${url}/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'user', content: prompt }
                ],
                stream: true
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
                    if (data.message?.content) {
                        yield data.message.content;
                    }
                } catch (e) {
                    // JSON 파싱 오류 무시
                }
            }
        }
    }
    
    // 추천 사용 방법
    async generate(prompt, options = {}) {
        const {
            model = 'glm-4.6:cloud',
            useDirectAPI = false,  // false: 로컬 경유 (기본), true: 직접 API
            stream = false
        } = options;
        
        try {
            if (stream) {
                return this.streamGenerate(prompt, model, useDirectAPI);
            }
            
            if (useDirectAPI) {
                return await this.directAPICall(prompt, model);
            } else {
                return await this.localAPICall(prompt, model);
            }
        } catch (error) {
            console.error('Ollama API 오류:', error);
            throw error;
        }
    }
}

// 사용 예제
/*
// 1. 로컬 Ollama 경유 (API 키 불필요, ollama signin만 필요)
const ollama = new OllamaDirectAPI();
const response = await ollama.generate('Hello world');

// 2. 직접 API 호출 (API 키 필요)
const ollamaWithKey = new OllamaDirectAPI('your-api-key-from-ollama.com');
const directResponse = await ollamaWithKey.generate('Hello world', { useDirectAPI: true });

// 3. 스트리밍
for await (const chunk of await ollama.generate('Tell me a story', { stream: true })) {
    console.log(chunk);
}
*/

window.ollamaDirectAPI = new OllamaDirectAPI();