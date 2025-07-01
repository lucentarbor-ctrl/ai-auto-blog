import asyncio
import aiohttp
from datetime import datetime
from typing import List, Dict, Optional
import json
import feedparser
from bs4 import BeautifulSoup

class AINewsCrawler:
    """AI 뉴스 자동 수집 및 처리 시스템"""
    
    def __init__(self):
        self.sources = {
            'openai': {
                'url': 'https://openai.com/blog',
                'rss': 'https://openai.com/blog/rss.xml',
                'name': 'OpenAI'
            },
            'anthropic': {
                'url': 'https://www.anthropic.com/news',
                'rss': None,
                'name': 'Anthropic'
            },
            'google_ai': {
                'url': 'https://ai.google/discover',
                'rss': None,
                'name': 'Google AI'
            },
            'reddit_ai': {
                'url': 'https://www.reddit.com/r/artificial/hot.json',
                'api': True,
                'name': 'Reddit AI'
            },
            'hackernews': {
                'url': 'https://hn.algolia.com/api/v1/search?tags=ai',
                'api': True,
                'name': 'Hacker News'
            }
        }
        
    async def fetch_all_news(self) -> List[Dict]:
        """모든 소스에서 뉴스 수집"""
        async with aiohttp.ClientSession() as session:
            tasks = []
            for source_id, source_info in self.sources.items():
                if source_info.get('rss'):
                    tasks.append(self.fetch_rss_news(session, source_id, source_info))
                elif source_info.get('api'):
                    tasks.append(self.fetch_api_news(session, source_id, source_info))
                else:
                    tasks.append(self.fetch_web_news(session, source_id, source_info))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
        # 결과 통합 및 정렬
        all_news = []
        for result in results:
            if isinstance(result, list):
                all_news.extend(result)
        
        # 날짜순 정렬
        all_news.sort(key=lambda x: x.get('published_date', datetime.now()), reverse=True)
        
        return all_news
    
    async def fetch_rss_news(self, session, source_id: str, source_info: Dict) -> List[Dict]:
        """RSS 피드에서 뉴스 수집"""
        try:
            async with session.get(source_info['rss']) as response:
                content = await response.text()
                
            feed = feedparser.parse(content)
            news_items = []
            
            for entry in feed.entries[:10]:  # 최신 10개만
                news_items.append({
                    'source_id': source_id,
                    'source_name': source_info['name'],
                    'title': entry.title,
                    'url': entry.link,
                    'summary': entry.get('summary', ''),
                    'published_date': datetime(*entry.published_parsed[:6]) if hasattr(entry, 'published_parsed') else datetime.now(),
                    'tags': [tag.term for tag in entry.get('tags', [])],
                    'crawled_date': datetime.now()
                })
                
            return news_items
            
        except Exception as e:
            print(f"Error fetching RSS from {source_id}: {e}")
            return []
    
    async def fetch_api_news(self, session, source_id: str, source_info: Dict) -> List[Dict]:
        """API에서 뉴스 수집"""
        try:
            headers = {'User-Agent': 'AI-Auto-Blog/1.0'}
            async with session.get(source_info['url'], headers=headers) as response:
                data = await response.json()
            
            news_items = []
            
            if source_id == 'reddit_ai':
                for post in data.get('data', {}).get('children', [])[:10]:
                    post_data = post['data']
                    news_items.append({
                        'source_id': source_id,
                        'source_name': source_info['name'],
                        'title': post_data['title'],
                        'url': f"https://reddit.com{post_data['permalink']}",
                        'summary': post_data.get('selftext', '')[:500],
                        'published_date': datetime.fromtimestamp(post_data['created_utc']),
                        'tags': ['Reddit', 'AI'],
                        'score': post_data.get('score', 0),
                        'crawled_date': datetime.now()
                    })
                    
            elif source_id == 'hackernews':
                for hit in data.get('hits', [])[:10]:
                    news_items.append({
                        'source_id': source_id,
                        'source_name': source_info['name'],
                        'title': hit['title'],
                        'url': hit.get('url', f"https://news.ycombinator.com/item?id={hit['objectID']}"),
                        'summary': '',
                        'published_date': datetime.fromtimestamp(hit['created_at_i']),
                        'tags': hit.get('_tags', []),
                        'score': hit.get('points', 0),
                        'crawled_date': datetime.now()
                    })
            
            return news_items
            
        except Exception as e:
            print(f"Error fetching API from {source_id}: {e}")
            return []
    
    async def fetch_web_news(self, session, source_id: str, source_info: Dict) -> List[Dict]:
        """웹 페이지에서 뉴스 스크래핑 (시뮬레이션)"""
        # 실제 구현시에는 BeautifulSoup 등을 사용
        # 여기서는 샘플 데이터 반환
        return [
            {
                'source_id': source_id,
                'source_name': source_info['name'],
                'title': f"Sample news from {source_info['name']}",
                'url': source_info['url'],
                'summary': 'This is a sample news item...',
                'published_date': datetime.now(),
                'tags': ['AI', source_info['name']],
                'crawled_date': datetime.now()
            }
        ]
    
    def analyze_news_relevance(self, news_item: Dict) -> float:
        """뉴스 관련성 점수 계산"""
        score = 0.0
        
        # 제목과 요약에서 키워드 분석
        keywords = ['ai', 'artificial intelligence', 'machine learning', 'deep learning',
                   'gpt', 'claude', 'gemini', 'llm', 'neural network', 'automation']
        
        title_lower = news_item['title'].lower()
        summary_lower = news_item.get('summary', '').lower()
        
        for keyword in keywords:
            if keyword in title_lower:
                score += 2.0
            if keyword in summary_lower:
                score += 1.0
        
        # 소스별 가중치
        source_weights = {
            'openai': 1.5,
            'anthropic': 1.5,
            'google_ai': 1.3,
            'reddit_ai': 1.0,
            'hackernews': 1.2
        }
        
        score *= source_weights.get(news_item['source_id'], 1.0)
        
        # 최근성 가중치
        age_days = (datetime.now() - news_item['published_date']).days
        if age_days == 0:
            score *= 2.0
        elif age_days == 1:
            score *= 1.5
        elif age_days <= 3:
            score *= 1.2
        
        # 인기도 (있는 경우)
        if 'score' in news_item:
            if news_item['score'] > 100:
                score *= 1.5
            elif news_item['score'] > 50:
                score *= 1.2
        
        return min(score, 10.0)  # 최대 10점
    
    async def translate_and_localize(self, news_item: Dict) -> Dict:
        """뉴스 번역 및 로컬라이징 (시뮬레이션)"""
        # 실제로는 AI API를 사용하여 번역
        news_item['korean_title'] = f"[번역] {news_item['title']}"
        news_item['korean_summary'] = f"[한국어 요약] {news_item.get('summary', '')[:200]}..."
        news_item['localized'] = True
        
        return news_item
    
    async def process_news_pipeline(self) -> List[Dict]:
        """전체 뉴스 처리 파이프라인"""
        # 1. 뉴스 수집
        print("뉴스 수집 중...")
        all_news = await self.fetch_all_news()
        print(f"총 {len(all_news)}개의 뉴스를 수집했습니다.")
        
        # 2. 관련성 분석
        print("관련성 분석 중...")
        for news in all_news:
            news['relevance_score'] = self.analyze_news_relevance(news)
        
        # 3. 상위 뉴스 선별
        top_news = sorted(all_news, key=lambda x: x['relevance_score'], reverse=True)[:10]
        
        # 4. 번역 및 로컬라이징
        print("번역 중...")
        translated_news = []
        for news in top_news:
            translated = await self.translate_and_localize(news)
            translated_news.append(translated)
        
        return translated_news


# 테스트 실행
if __name__ == "__main__":
    crawler = AINewsCrawler()
    
    async def test_crawler():
        news = await crawler.process_news_pipeline()
        
        print("\n=== 수집된 상위 뉴스 ===")
        for i, item in enumerate(news, 1):
            print(f"\n{i}. [{item['source_name']}] {item['title']}")
            print(f"   점수: {item['relevance_score']:.2f}")
            print(f"   URL: {item['url']}")
            print(f"   한국어: {item.get('korean_title', 'N/A')}")
    
    asyncio.run(test_crawler())