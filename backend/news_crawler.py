#!/usr/bin/env python3
"""
AI 뉴스 크롤러
실시간으로 AI 관련 뉴스를 수집하는 시스템
"""

import json
import requests
from datetime import datetime, timezone
from bs4 import BeautifulSoup
import feedparser
import time
from typing import List, Dict
import hashlib
import re
from urllib.parse import quote

class AINewsCrawler:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
    def clean_text(self, text):
        """텍스트 정리"""
        if not text:
            return ""
        # HTML 태그 제거
        text = re.sub('<.*?>', '', text)
        # 여러 공백을 하나로
        text = ' '.join(text.split())
        return text.strip()
    
    def generate_id(self, url):
        """URL로부터 고유 ID 생성"""
        return hashlib.md5(url.encode()).hexdigest()[:12]
    
    def search_google_news(self, keywords: List[str]) -> List[Dict]:
        """구글 뉴스에서 AI 관련 뉴스 검색"""
        news_items = []
        
        for keyword in keywords:
            try:
                # Google News RSS 피드 사용
                rss_url = f"https://news.google.com/rss/search?q={quote(keyword)}&hl=ko&gl=KR&ceid=KR:ko"
                feed = feedparser.parse(rss_url)
                
                for entry in feed.entries[:10]:  # 키워드당 최대 10개
                    news_item = {
                        'id': self.generate_id(entry.link),
                        'title': entry.title,
                        'link': entry.link,
                        'source': 'Google News',
                        'published': entry.get('published', ''),
                        'summary': self.clean_text(entry.get('summary', '')),
                        'keyword': keyword,
                        'collected_at': datetime.now(timezone.utc).isoformat()
                    }
                    news_items.append(news_item)
                    
            except Exception as e:
                print(f"Google News 크롤링 오류 ({keyword}): {e}")
        
        return news_items
    
    def search_reddit(self, keywords: List[str]) -> List[Dict]:
        """Reddit에서 AI 관련 포스트 검색"""
        news_items = []
        subreddits = ['artificial', 'MachineLearning', 'technology', 'programming']
        
        for keyword in keywords:
            for subreddit in subreddits:
                try:
                    url = f"https://www.reddit.com/r/{subreddit}/search.json?q={quote(keyword)}&sort=new&limit=5"
                    response = requests.get(url, headers={**self.headers, 'User-Agent': 'AINewsCrawler/1.0'})
                    
                    if response.status_code == 200:
                        data = response.json()
                        posts = data.get('data', {}).get('children', [])
                        
                        for post in posts:
                            post_data = post.get('data', {})
                            news_item = {
                                'id': self.generate_id(post_data.get('url', '')),
                                'title': post_data.get('title', ''),
                                'link': f"https://reddit.com{post_data.get('permalink', '')}",
                                'source': f'Reddit r/{subreddit}',
                                'published': datetime.fromtimestamp(post_data.get('created_utc', 0)).isoformat(),
                                'summary': self.clean_text(post_data.get('selftext', ''))[:500],
                                'keyword': keyword,
                                'score': post_data.get('score', 0),
                                'num_comments': post_data.get('num_comments', 0),
                                'collected_at': datetime.now(timezone.utc).isoformat()
                            }
                            news_items.append(news_item)
                    
                    time.sleep(2)  # Reddit API 제한 준수
                    
                except Exception as e:
                    print(f"Reddit 크롤링 오류 ({subreddit}/{keyword}): {e}")
        
        return news_items
    
    def search_hackernews(self, keywords: List[str]) -> List[Dict]:
        """Hacker News에서 AI 관련 뉴스 검색"""
        news_items = []
        
        for keyword in keywords:
            try:
                # Algolia HN Search API 사용
                url = f"https://hn.algolia.com/api/v1/search?query={quote(keyword)}&tags=story&hitsPerPage=10"
                response = requests.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    for hit in data.get('hits', []):
                        news_item = {
                            'id': self.generate_id(hit.get('url', hit.get('objectID', ''))),
                            'title': hit.get('title', ''),
                            'link': hit.get('url', f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}"),
                            'source': 'Hacker News',
                            'published': hit.get('created_at', ''),
                            'summary': f"Points: {hit.get('points', 0)}, Comments: {hit.get('num_comments', 0)}",
                            'keyword': keyword,
                            'author': hit.get('author', ''),
                            'points': hit.get('points', 0),
                            'num_comments': hit.get('num_comments', 0),
                            'collected_at': datetime.now(timezone.utc).isoformat()
                        }
                        news_items.append(news_item)
                        
            except Exception as e:
                print(f"Hacker News 크롤링 오류 ({keyword}): {e}")
        
        return news_items
    
    def search_arxiv(self, keywords: List[str]) -> List[Dict]:
        """arXiv에서 최신 AI 논문 검색"""
        news_items = []
        
        for keyword in keywords:
            try:
                # arXiv API 사용
                url = f"http://export.arxiv.org/api/query?search_query=all:{quote(keyword)}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending"
                response = requests.get(url)
                
                if response.status_code == 200:
                    feed = feedparser.parse(response.content)
                    
                    for entry in feed.entries:
                        news_item = {
                            'id': self.generate_id(entry.id),
                            'title': f"[논문] {entry.title}",
                            'link': entry.id,
                            'source': 'arXiv',
                            'published': entry.published,
                            'summary': self.clean_text(entry.summary)[:500],
                            'keyword': keyword,
                            'authors': [author.name for author in entry.authors],
                            'categories': [tag.term for tag in entry.tags],
                            'collected_at': datetime.now(timezone.utc).isoformat()
                        }
                        news_items.append(news_item)
                        
            except Exception as e:
                print(f"arXiv 크롤링 오류 ({keyword}): {e}")
        
        return news_items
    
    def crawl_all_sources(self, keywords: List[str], sources: List[str]) -> Dict:
        """모든 소스에서 뉴스 크롤링"""
        all_news = []
        
        print(f"크롤링 시작: {keywords}, 소스: {sources}")
        
        if 'google' in sources:
            print("Google News 크롤링 중...")
            all_news.extend(self.search_google_news(keywords))
        
        if 'reddit' in sources:
            print("Reddit 크롤링 중...")
            all_news.extend(self.search_reddit(keywords))
        
        if 'hackernews' in sources:
            print("Hacker News 크롤링 중...")
            all_news.extend(self.search_hackernews(keywords))
        
        if 'arxiv' in sources:
            print("arXiv 크롤링 중...")
            all_news.extend(self.search_arxiv(keywords))
        
        # 중복 제거 (ID 기준)
        unique_news = {}
        for item in all_news:
            unique_news[item['id']] = item
        
        result = {
            'status': 'success',
            'crawled_at': datetime.now(timezone.utc).isoformat(),
            'keywords': keywords,
            'sources': sources,
            'total_items': len(unique_news),
            'items': list(unique_news.values())
        }
        
        # 최신순으로 정렬
        result['items'].sort(key=lambda x: x.get('collected_at', ''), reverse=True)
        
        return result

# Flask 서버
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # CORS 허용

crawler = AINewsCrawler()

@app.route('/api/news/crawl', methods=['POST'])
def crawl_news():
    """뉴스 크롤링 API"""
    try:
        data = request.get_json()
        keywords = data.get('keywords', ['AI', '인공지능'])
        sources = data.get('sources', ['google', 'reddit', 'hackernews'])
        
        if not keywords:
            return jsonify({'status': 'error', 'message': '키워드를 입력해주세요'}), 400
        
        result = crawler.crawl_all_sources(keywords, sources)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/news/test', methods=['GET'])
def test_news():
    """테스트용 API"""
    sample_result = crawler.crawl_all_sources(['ChatGPT', 'AI'], ['google', 'hackernews'])
    return jsonify(sample_result)

@app.route('/api/news/translate', methods=['POST'])
def translate_news():
    """뉴스 번역 API (구글 번역 API 사용 시뮬레이션)"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        # 실제로는 Google Translate API나 Papago API를 사용
        # 여기서는 시뮬레이션
        translated = f"[번역됨] {text}"
        
        return jsonify({
            'status': 'success',
            'original': text,
            'translated': translated
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/news/summarize', methods=['POST'])
def summarize_news():
    """뉴스 요약 API"""
    try:
        data = request.get_json()
        items = data.get('items', [])
        
        # AI를 사용한 요약 (여기서는 간단한 시뮬레이션)
        summary = {
            'status': 'success',
            'summary': f"총 {len(items)}개의 뉴스를 분석했습니다. 주요 트렌드: AI 기술 발전, 새로운 모델 출시, 규제 논의 등",
            'key_topics': ['GPT-5 출시 예정', 'AI 규제 강화', '오픈소스 AI 확산'],
            'recommended_posts': [
                {
                    'title': 'AI 주간 트렌드 정리',
                    'content': '이번 주 AI 업계의 주요 소식을 정리했습니다...'
                }
            ]
        }
        
        return jsonify(summary)
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    print("AI 뉴스 크롤러 서버 시작...")
    print("http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)