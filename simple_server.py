#!/usr/bin/env python3
"""
간단한 HTTP 서버 - AI Auto Blog
"""
import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse

# 포트 설정: 커맨드 라인 인자 또는 환경변수 또는 기본값 8080
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.getenv('PORT', 8080))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # 프로젝트 루트 디렉토리를 서빙 (full-featured-blog.html 접근 가능)
        super().__init__(*args, directory=".", **kwargs)

    def do_GET(self):
        # 경로 파싱
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # 루트 경로를 full-featured-blog.html로 리다이렉트
        if path == "/" or path == "":
            self.path = "/full-featured-blog.html"

        # 기본 핸들러 호출
        return super().do_GET()
    
    def end_headers(self):
        # CORS 헤더 추가
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 AI Auto Blog 서버가 시작되었습니다!")
        print(f"📍 메인 블로그: http://localhost:{PORT}/full-featured-blog.html")
        print(f"📍 프론트엔드: http://localhost:{PORT}/frontend/")
        print(f"📍 관리자 페이지: http://localhost:{PORT}/frontend/admin/dashboard.html")
        print(f"\n종료하려면 Ctrl+C를 누르세요.")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n서버를 종료합니다.")