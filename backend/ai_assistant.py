#!/usr/bin/env python3
"""
AI 글쓰기 도우미 백엔드
OpenAI API를 활용한 콘텐츠 생성 서비스
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import List, Dict
import re

# OpenAI API 키 (환경변수에서 가져오기)
# export OPENAI_API_KEY="your-api-key"
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# 개발 중에는 더미 응답 사용
USE_DUMMY_RESPONSES = True  # API 키가 없을 때는 True로 설정

app = Flask(__name__)
CORS(app)

class AIAssistant:
    def __init__(self):
        self.api_key = OPENAI_API_KEY
        if not self.api_key and not USE_DUMMY_RESPONSES:
            raise ValueError("OpenAI API 키가 설정되지 않았습니다.")
    
    def generate_titles(self, topic: str, keywords: List[str] = None) -> List[Dict]:
        """SEO 최적화된 제목 5개 생성"""
        if USE_DUMMY_RESPONSES:
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
                },
                {
                    "title": f"{topic}의 모든 것: 알아야 할 핵심 포인트 10가지",
                    "seo_score": 87,
                    "keywords": keywords or ["핵심", "포인트", "정리"]
                },
                {
                    "title": f"실전! {topic} 활용법과 성공 사례",
                    "seo_score": 85,
                    "keywords": keywords or ["실전", "활용법", "사례"]
                },
                {
                    "title": f"{topic} 입문자를 위한 친절한 설명서",
                    "seo_score": 83,
                    "keywords": keywords or ["입문", "설명서", "기초"]
                }
            ]
        
        # TODO: 실제 OpenAI API 호출 구현
        pass
    
    def expand_text(self, text: str, style: str = "detailed") -> str:
        """텍스트 확장"""
        if USE_DUMMY_RESPONSES:
            expanded = f"{text}\n\n"
            expanded += "이에 대해 더 자세히 설명하자면, "
            expanded += "여러 관점에서 이 주제를 살펴볼 필요가 있습니다. "
            expanded += "첫째, 기본적인 개념부터 차근차근 이해해보겠습니다. "
            expanded += "둘째, 실제 적용 사례를 통해 구체적으로 알아보겠습니다. "
            expanded += "셋째, 향후 발전 방향과 가능성에 대해서도 논의해보겠습니다."
            return expanded
        
        # TODO: 실제 OpenAI API 호출 구현
        pass
    
    def summarize_text(self, text: str, max_length: int = 200) -> str:
        """텍스트 요약"""
        if USE_DUMMY_RESPONSES:
            words = text.split()
            if len(words) > 20:
                summary = ' '.join(words[:20]) + "..."
                return f"요약: {summary} (원문의 핵심 내용을 간단히 정리했습니다)"
            return f"요약: {text}"
        
        # TODO: 실제 OpenAI API 호출 구현
        pass
    
    def change_tone(self, text: str, tone: str) -> str:
        """문체 변경"""
        tone_styles = {
            "professional": "전문적이고 격식 있는",
            "friendly": "친근하고 편안한",
            "creative": "창의적이고 재미있는",
            "academic": "학술적이고 논리적인"
        }
        
        if USE_DUMMY_RESPONSES:
            style_desc = tone_styles.get(tone, "일반적인")
            return f"[{style_desc} 톤으로 변경]\n{text}"
        
        # TODO: 실제 OpenAI API 호출 구현
        pass
    
    def analyze_seo(self, title: str, content: str) -> Dict:
        """SEO 분석"""
        if USE_DUMMY_RESPONSES:
            # 간단한 SEO 분석 시뮬레이션
            word_count = len(content.split())
            title_length = len(title)
            
            score = 70
            if 50 <= title_length <= 60:
                score += 10
            if word_count >= 300:
                score += 10
            if "?" in title or "!" in title:
                score += 5
            
            return {
                "overall_score": min(score, 95),
                "title_analysis": {
                    "length": title_length,
                    "optimal": 50 <= title_length <= 60,
                    "suggestion": "제목 길이가 적절합니다" if 50 <= title_length <= 60 else "제목을 50-60자로 조정하세요"
                },
                "content_analysis": {
                    "word_count": word_count,
                    "readability": "좋음",
                    "keyword_density": "적절함"
                },
                "improvements": [
                    "메타 설명 추가 필요",
                    "이미지 alt 텍스트 추가",
                    "내부 링크 추가 권장"
                ]
            }
        
        # TODO: 실제 SEO 분석 구현
        pass
    
    def check_tone_consistency(self, new_text: str, reference_texts: List[str]) -> Dict:
        """톤 일관성 체크"""
        if USE_DUMMY_RESPONSES:
            return {
                "consistency_score": 85,
                "analysis": {
                    "formality": "일관됨",
                    "sentiment": "긍정적",
                    "complexity": "적절함"
                },
                "suggestions": [
                    "전체적으로 톤이 일관되게 유지되고 있습니다",
                    "일부 문장에서 좀 더 친근한 표현을 사용하면 좋겠습니다"
                ]
            }
        
        # TODO: 실제 톤 분석 구현
        pass

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

@app.route('/api/ai/test', methods=['GET'])
def test_ai():
    """AI API 테스트"""
    return jsonify({
        'status': 'success',
        'message': 'AI Assistant API is running',
        'dummy_mode': USE_DUMMY_RESPONSES,
        'endpoints': [
            '/api/ai/generate-titles',
            '/api/ai/expand',
            '/api/ai/summarize',
            '/api/ai/change-tone',
            '/api/ai/analyze-seo',
            '/api/ai/check-tone'
        ]
    })

if __name__ == '__main__':
    print("AI 글쓰기 도우미 서버 시작...")
    print(f"더미 응답 모드: {USE_DUMMY_RESPONSES}")
    if not USE_DUMMY_RESPONSES and not OPENAI_API_KEY:
        print("경고: OpenAI API 키가 설정되지 않았습니다!")
    print("http://localhost:5002")
    app.run(host='0.0.0.0', port=5002, debug=True)