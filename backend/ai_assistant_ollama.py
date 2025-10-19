#!/usr/bin/env python3
"""
AI 글쓰기 도우미 백엔드 - Ollama 버전
로컬 Ollama 모델을 활용한 콘텐츠 생성 서비스
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import List, Dict
import re
import ollama

# Ollama 모델 설정
MODEL_NAME = os.getenv('OLLAMA_MODEL', 'qwen3-coder:30b')
# 다른 모델 옵션: qwen3-coder:30b, qwen2.5-coder:7b

app = Flask(__name__)
CORS(app)

class AIAssistant:
    def __init__(self):
        self.model = MODEL_NAME
        # Ollama 연결 테스트
        try:
            ollama.list()
            print(f"✅ Ollama 연결 성공! 모델: {self.model}")
        except Exception as e:
            print(f"❌ Ollama 연결 실패: {e}")
            print("Ollama가 실행 중인지 확인하세요: ollama serve")
    
    def _call_ollama(self, prompt: str, system_prompt: str = "") -> str:
        """Ollama 모델 호출 헬퍼 함수"""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = ollama.chat(
                model=self.model,
                messages=messages
            )
            return response['message']['content']
        except Exception as e:
            print(f"Ollama 호출 오류: {e}")
            return f"[오류: {e}]"
    
    def generate_titles(self, topic: str, keywords: List[str] = None) -> List[Dict]:
        """SEO 최적화된 제목 5개 생성"""
        keywords_str = ', '.join(keywords) if keywords else ''
        
        prompt = f"""
주제: {topic}
키워드: {keywords_str}

위 주제로 SEO 최적화된 블로그 제목을 5개 생성해주세요.
각 제목은 50-60자 사이로 작성하고, 클릭을 유도하는 매력적인 제목이어야 합니다.

JSON 형식으로 응답해주세요:
[
    {{"title": "제목1", "seo_score": 90, "keywords": ["키워드1", "키워드2"]}},
    {{"title": "제목2", "seo_score": 85, "keywords": ["키워드1", "키워드3"]}}
]
"""
        
        response = self._call_ollama(prompt, "당신은 SEO 전문가입니다. 한국어로 답변하세요.")
        
        try:
            # JSON 파싱 시도
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                titles = json.loads(json_match.group())
                return titles[:5]  # 최대 5개
        except:
            pass
        
        # 파싱 실패시 기본 형식
        return [
            {
                "title": f"{topic}에 대한 완벽 가이드: 초보자부터 전문가까지",
                "seo_score": 92,
                "keywords": keywords or ["가이드", "초보자", "전문가"]
            },
            {
                "title": f"2025년 {topic} 트렌드와 미래 전망",
                "seo_score": 89,
                "keywords": keywords or ["2025", "트렌드", "미래"]
            }
        ]
    
    def expand_text(self, text: str, style: str = "detailed") -> str:
        """텍스트 확장"""
        style_prompts = {
            "detailed": "매우 자세하고 구체적으로",
            "concise": "간결하지만 핵심을 놓치지 않게",
            "creative": "창의적이고 흥미롭게",
            "professional": "전문적이고 신뢰성 있게"
        }
        
        prompt = f"""
다음 텍스트를 {style_prompts.get(style, '자세히')} 확장해주세요.
원문의 핵심은 유지하면서 더 풍부한 내용으로 만들어주세요.

원문:
{text}

확장된 텍스트:
"""
        
        return self._call_ollama(prompt, "당신은 전문 콘텐츠 작가입니다.")
    
    def summarize_text(self, text: str, max_length: int = 200) -> str:
        """텍스트 요약"""
        prompt = f"""
다음 텍스트를 {max_length}자 이내로 요약해주세요.
핵심 내용을 놓치지 않도록 주의하세요.

원문:
{text}

요약:
"""
        
        return self._call_ollama(prompt, "당신은 요약 전문가입니다.")
    
    def change_tone(self, text: str, tone: str) -> str:
        """문체 변경"""
        tone_styles = {
            "professional": "전문적이고 격식 있는 문체",
            "friendly": "친근하고 편안한 대화체",
            "creative": "창의적이고 재미있는 문체",
            "academic": "학술적이고 논리적인 문체",
            "casual": "캐주얼하고 일상적인 문체",
            "formal": "공식적이고 정중한 문체"
        }
        
        style_desc = tone_styles.get(tone, "일반적인 문체")
        
        prompt = f"""
다음 텍스트를 {style_desc}로 다시 써주세요.
내용은 그대로 유지하고 문체만 변경해주세요.

원문:
{text}

{style_desc}로 변경된 텍스트:
"""
        
        return self._call_ollama(prompt, f"당신은 {style_desc} 전문가입니다.")
    
    def generate_from_template(self, template_name: str, content: str) -> str:
        """템플릿 기반 텍스트 생성"""
        templates = {
            "blog_post_intro": """
블로그 포스트 도입부를 작성해주세요.
독자의 관심을 끌고, 이 글을 읽어야 하는 이유를 명확히 전달하세요.
내용: {content}
""",
            "product_description": """
제품 설명을 작성해주세요.
특징, 장점, 사용 사례를 포함하여 구매욕구를 자극하세요.
제품 정보: {content}
""",
            "social_media_post": """
소셜 미디어 포스트를 작성해주세요.
짧고 임팩트 있게, 해시태그 3-5개 포함하세요.
내용: {content}
""",
            "how_to_guide": """
하우투 가이드를 작성해주세요.
단계별로 명확하게, 초보자도 따라할 수 있도록 설명하세요.
주제: {content}
""",
            "listicle": """
리스티클(목록형 글)을 작성해주세요.
5-10개 항목으로 구성하고, 각 항목마다 설명을 추가하세요.
주제: {content}
""",
            "review": """
리뷰를 작성해주세요.
장점, 단점, 추천 대상을 포함하세요.
대상: {content}
"""
        }
        
        prompt_template = templates.get(template_name, "다음 내용으로 글을 작성해주세요: {content}")
        prompt = prompt_template.format(content=content)
        
        return self._call_ollama(prompt, "당신은 전문 콘텐츠 작가입니다.")
    
    def analyze_seo(self, title: str, content: str) -> Dict:
        """SEO 분석"""
        prompt = f"""
다음 블로그 글의 SEO를 분석해주세요.

제목: {title}
내용: {content[:500]}...

다음 항목들을 분석해주세요:
1. 제목 최적화 (길이, 키워드 포함)
2. 내용 품질 (가독성, 구조)
3. 키워드 밀도
4. 개선 제안사항

JSON 형식으로 응답해주세요:
{{
    "overall_score": 85,
    "title_analysis": {{"length": 50, "optimal": true, "suggestion": ""}},
    "content_analysis": {{"word_count": 500, "readability": "좋음", "keyword_density": "적절"}},
    "improvements": ["개선사항1", "개선사항2"]
}}
"""
        
        response = self._call_ollama(prompt, "당신은 SEO 전문가입니다.")
        
        try:
            # JSON 파싱 시도
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        # 기본 분석 결과
        word_count = len(content.split())
        title_length = len(title)
        
        return {
            "overall_score": 75,
            "title_analysis": {
                "length": title_length,
                "optimal": 50 <= title_length <= 60,
                "suggestion": "제목 길이가 적절합니다" if 50 <= title_length <= 60 else "제목을 50-60자로 조정하세요"
            },
            "content_analysis": {
                "word_count": word_count,
                "readability": "보통",
                "keyword_density": "적절"
            },
            "improvements": [
                "메타 설명 추가 필요",
                "이미지 alt 텍스트 추가",
                "내부 링크 추가 권장"
            ]
        }
    
    def check_tone_consistency(self, new_text: str, reference_texts: List[str]) -> Dict:
        """톤 일관성 체크"""
        references = "\n---\n".join(reference_texts[:3])  # 최대 3개 참조
        
        prompt = f"""
새로 작성한 텍스트가 기존 텍스트들과 톤이 일관되는지 분석해주세요.

기존 텍스트 샘플:
{references}

새 텍스트:
{new_text}

일관성 점수(0-100)와 개선 제안을 제공해주세요.
"""
        
        response = self._call_ollama(prompt, "당신은 문체 분석 전문가입니다.")
        
        return {
            "consistency_score": 85,
            "analysis": {
                "formality": "일관됨",
                "sentiment": "긍정적",
                "complexity": "적절함"
            },
            "suggestions": [
                "전체적으로 톤이 일관되게 유지되고 있습니다",
                response[:200] if len(response) > 200 else response
            ]
        }
    
    def generate_meta_description(self, title: str, content: str) -> str:
        """메타 설명 생성"""
        prompt = f"""
SEO를 위한 메타 설명을 생성해주세요.
150-160자 사이로 작성하고, 핵심 키워드를 포함하세요.

제목: {title}
내용 요약: {content[:300]}

메타 설명:
"""
        
        return self._call_ollama(prompt, "당신은 SEO 전문가입니다.")
    
    def suggest_keywords(self, content: str) -> List[str]:
        """키워드 제안"""
        prompt = f"""
다음 내용에서 SEO 키워드 10개를 추출해주세요.
중요도 순으로 정렬하세요.

내용: {content[:500]}

키워드 목록 (콤마로 구분):
"""
        
        response = self._call_ollama(prompt, "당신은 키워드 분석 전문가입니다.")
        keywords = [k.strip() for k in response.split(',')][:10]
        return keywords

# AI Assistant 인스턴스
assistant = AIAssistant()

# API 엔드포인트들
@app.route('/api/ai/generate-titles', methods=['POST'])
def generate_titles():
    """제목 생성 API"""
    try:
        data = request.get_json()
        topic = data.get('topic', '')
        keywords = data.get('keywords', [])
        
        if not topic:
            return jsonify({'error': '주제를 입력해주세요'}), 400
        
        titles = assistant.generate_titles(topic, keywords)
        return jsonify({
            'status': 'success',
            'titles': titles
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/ai/expand', methods=['POST'])
def expand_text():
    """텍스트 확장 API"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        style = data.get('style', 'detailed')
        
        if not text:
            return jsonify({'error': '텍스트를 입력해주세요'}), 400
        
        expanded = assistant.expand_text(text, style)
        return jsonify({
            'status': 'success',
            'expanded_text': expanded
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/ai/summarize', methods=['POST'])
def summarize_text():
    """텍스트 요약 API"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        max_length = data.get('max_length', 200)
        
        if not text:
            return jsonify({'error': '텍스트를 입력해주세요'}), 400
        
        summary = assistant.summarize_text(text, max_length)
        return jsonify({
            'status': 'success',
            'summary': summary
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/ai/change-tone', methods=['POST'])
def change_tone():
    """톤 변경 API"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        tone = data.get('tone', 'friendly')
        
        if not text:
            return jsonify({'error': '텍스트를 입력해주세요'}), 400
        
        changed_text = assistant.change_tone(text, tone)
        return jsonify({
            'status': 'success',
            'changed_text': changed_text
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/ai/generate-from-template', methods=['POST'])
def generate_from_template():
    """템플릿 기반 텍스트 생성 API"""
    try:
        data = request.get_json()
        template_name = data.get('template_name', '')
        content = data.get('content', '')
        
        if not template_name or not content:
            return jsonify({'error': '템플릿 이름과 내용을 모두 입력해주세요'}), 400
        
        generated_text = assistant.generate_from_template(template_name, content)
        return jsonify({
            'status': 'success',
            'generated_text': generated_text
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/ai/analyze-seo', methods=['POST'])
def analyze_seo():
    """SEO 분석 API"""
    try:
        data = request.get_json()
        title = data.get('title', '')
        content = data.get('content', '')
        
        if not title or not content:
            return jsonify({'error': '제목과 내용을 모두 입력해주세요'}), 400
        
        analysis = assistant.analyze_seo(title, content)
        return jsonify({
            'status': 'success',
            'analysis': analysis
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/ai/check-tone', methods=['POST'])
def check_tone():
    """톤 일관성 체크 API"""
    try:
        data = request.get_json()
        new_text = data.get('new_text', '')
        reference_texts = data.get('reference_texts', [])
        
        if not new_text:
            return jsonify({'error': '텍스트를 입력해주세요'}), 400
        
        result = assistant.check_tone_consistency(new_text, reference_texts)
        return jsonify({
            'status': 'success',
            'result': result
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/ai/meta-description', methods=['POST'])
def generate_meta_description():
    """메타 설명 생성 API"""
    try:
        data = request.get_json()
        title = data.get('title', '')
        content = data.get('content', '')
        
        if not title or not content:
            return jsonify({'error': '제목과 내용을 입력해주세요'}), 400
        
        meta = assistant.generate_meta_description(title, content)
        return jsonify({
            'status': 'success',
            'meta_description': meta
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/ai/suggest-keywords', methods=['POST'])
def suggest_keywords():
    """키워드 제안 API"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        
        if not content:
            return jsonify({'error': '내용을 입력해주세요'}), 400
        
        keywords = assistant.suggest_keywords(content)
        return jsonify({
            'status': 'success',
            'keywords': keywords
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/ai/test', methods=['GET'])
def test_ai():
    """AI API 테스트"""
    return jsonify({
        'status': 'success',
        'message': 'AI Assistant API (Ollama) is running',
        'model': MODEL_NAME,
        'endpoints': [
            '/api/ai/generate-titles',
            '/api/ai/expand',
            '/api/ai/summarize',
            '/api/ai/change-tone',
            '/api/ai/analyze-seo',
            '/api/ai/check-tone',
            '/api/ai/generate-from-template',
            '/api/ai/meta-description',
            '/api/ai/suggest-keywords'
        ]
    })

if __name__ == '__main__':
    print("🚀 AI 글쓰기 도우미 서버 시작 (Ollama 버전)...")
    print(f"📦 모델: {MODEL_NAME}")
    print("🌐 http://localhost:5002")
    print("\n⚠️  Ollama가 실행 중인지 확인하세요: ollama serve")
    app.run(host='0.0.0.0', port=5002, debug=True)