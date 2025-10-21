# AI Auto Blog System 🤖

AI 기반 자동 블로그 콘텐츠 생성 및 관리 시스템

> 🚀 **GitHub Actions 자동 배포 활성화!** 코드 푸시 시 EC2 서버에 자동 배포됩니다.

## 🌟 주요 기능

### 🧠 AI 멀티모델 시스템
- **6개 AI 모델 동시 생성**: Gemini Flash, Gemini Pro, DeepSeek, Qwen, GPT-OSS, Kimi
- **실시간 스트리밍 출력**: Ollama 모델 실시간 스트리밍 지원
- **자동 품질 평가**: 관련성, 완성도, 창의성, 가독성, SEO 점수 자동 계산
- **비용 효율성 분석**: 모델별 비용 추적 및 ROI 분석

### 📚 콘텐츠 관리
- **프롬프트 라이브러리**: 블로그, 리뷰, 튜토리얼 등 다양한 템플릿
- **콘텐츠 데이터베이스**: 생성된 모든 콘텐츠 검색 및 관리
- **스마트 에디터**: AI 어시스턴트 기반 글쓰기 도구

### 📊 분석 및 최적화
- **실시간 대시보드**: 블로그 운영 현황 한눈에 확인
- **독자 분석**: 독자 행동 패턴 및 선호도 분석
- **SEO 최적화**: 자동 SEO 점수 계산 및 개선 제안

## 🚀 시작하기

### 필수 요구사항
- Node.js 16.0 이상
- npm 또는 yarn
- Ollama (로컬 AI 모델용)
- Google Gemini API 키

### 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/yourusername/ai-auto-blog.git
cd ai-auto-blog
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
cp .env.example .env
```
`.env` 파일을 열고 필요한 API 키와 설정을 입력하세요.

4. **Ollama 설치 및 설정**
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# 모델 다운로드
ollama pull deepseek-v3
ollama pull qwen2.5-coder
ollama pull llama3.3
ollama pull qwen2.5

# CORS 활성화하여 실행
OLLAMA_ORIGINS="*" OLLAMA_HOST="0.0.0.0:11434" ollama serve
```

5. **애플리케이션 실행**
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm run build
npm start
```

6. **브라우저에서 열기**
```
http://localhost:3000
```

## 🔑 API 키 설정

### Google Gemini API
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. "Create API Key" 클릭
3. 생성된 키를 `.env` 파일의 `GEMINI_API_KEY`에 입력

### Ollama Cloud (선택사항)
1. [Ollama Cloud](https://ollama.com/cloud) 가입
2. API 키 생성
3. `.env` 파일의 `OLLAMA_CLOUD_API_KEY`에 입력

## 🚢 AWS 배포 가이드

### EC2 인스턴스 설정

1. **EC2 인스턴스 생성**
   - AMI: Ubuntu 22.04 LTS
   - 인스턴스 타입: t3.medium 이상 권장
   - 보안 그룹: 포트 3000, 22, 11434 오픈

2. **인스턴스 접속**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

3. **Node.js 설치**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **프로젝트 배포**
```bash
git clone https://github.com/yourusername/ai-auto-blog.git
cd ai-auto-blog
npm install
npm run build
```

5. **PM2로 프로세스 관리**
```bash
sudo npm install -g pm2
pm2 start npm --name "ai-blog" -- start
pm2 save
pm2 startup
```

### S3 버킷 설정

1. **S3 버킷 생성**
   - 버킷 이름: `your-blog-content`
   - 리전: `ap-northeast-2`
   - 퍼블릭 액세스 차단 해제 (정적 웹사이트 호스팅용)

2. **IAM 사용자 생성**
   - `AmazonS3FullAccess` 정책 연결
   - 액세스 키 생성
   - `.env` 파일에 키 추가

### CloudFront 설정 (선택사항)

1. **CloudFront 배포 생성**
   - Origin: S3 버킷
   - Caching: 최적화된 캐싱 정책 적용
   - SSL 인증서 설정

## 📁 프로젝트 구조

```
ai-auto-blog/
├── frontend/              # 프론트엔드 파일
│   ├── modern-blog.html  # 메인 대시보드
│   ├── advanced-multi-model.html  # AI 멀티모델 시스템
│   ├── multi-model-blog.html     # 6-AI 동시 생성
│   ├── content-database.html     # 콘텐츠 DB
│   ├── cost-analysis.html        # 비용 분석
│   └── prompt-library.html       # 프롬프트 라이브러리
├── backend/              # 백엔드 서버 (개발 예정)
├── js/                   # JavaScript 파일
│   ├── gemini-api.js    # Gemini API 통합
│   ├── ollama-cloud-manager.js  # Ollama 관리
│   └── data-manager.js  # 데이터 관리
├── config/               # 설정 파일
├── docs/                 # 문서
├── .env.example         # 환경 변수 템플릿
├── .gitignore          # Git 제외 파일
├── package.json        # NPM 패키지 설정
└── README.md          # 프로젝트 문서
```

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **AI Models**: 
  - Google Gemini (Flash & Pro)
  - Ollama (DeepSeek, Qwen, GPT-OSS, Kimi)
- **Storage**: LocalStorage, AWS S3
- **Deployment**: AWS EC2, CloudFront
- **Process Manager**: PM2

## 📈 성능 최적화

- **캐싱**: LocalStorage를 활용한 클라이언트 사이드 캐싱
- **스트리밍**: Server-Sent Events를 통한 실시간 스트리밍
- **비동기 처리**: Promise.all을 활용한 병렬 AI 요청
- **지연 로딩**: 필요한 컴포넌트만 동적 로드

## 🔐 보안 고려사항

- API 키는 절대 클라이언트 코드에 포함시키지 마세요
- 프로덕션 환경에서는 백엔드 프록시 서버 사용 권장
- HTTPS 사용 필수
- CORS 정책 적절히 설정

## 🤝 기여하기

프로젝트에 기여하고 싶으시면 Pull Request를 보내주세요!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 Issues를 통해 남겨주세요.

---

**Made with ❤️ by AI Auto Blog Team**