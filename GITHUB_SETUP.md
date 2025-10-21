# GitHub 리포지토리 설정 가이드 🚀

## 1. GitHub 리포지토리 생성

### 웹 브라우저에서 설정
1. [GitHub.com](https://github.com) 로그인
2. 우측 상단 '+' 버튼 → 'New repository' 클릭
3. 다음 정보 입력:
   - **Repository name**: `ai-auto-blog`
   - **Description**: AI-powered automatic blog content generation and management system
   - **Public/Private**: Public 선택
   - **Initialize repository**: 체크하지 마세요 (이미 로컬에 코드가 있음)
4. 'Create repository' 클릭

### 로컬 프로젝트와 연결
```bash
# GitHub 리포지토리 원격 저장소 추가
git remote add origin https://github.com/YOUR_USERNAME/ai-auto-blog.git

# 또는 SSH 사용
git remote add origin git@github.com:YOUR_USERNAME/ai-auto-blog.git

# 원격 저장소 확인
git remote -v

# 코드 푸시
git push -u origin main
```

## 2. GitHub Actions 설정 (선택사항)

### 자동 배포 워크플로우
`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to AWS S3
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      run: |
        aws s3 sync ./frontend s3://${{ secrets.S3_BUCKET_NAME }} --delete
        
    - name: Invalidate CloudFront
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      run: |
        aws cloudfront create-invalidation \
          --distribution-id ${{ secrets.CLOUDFRONT_DIST_ID }} \
          --paths "/*"
```

## 3. GitHub Secrets 설정

리포지토리 Settings → Secrets and variables → Actions에서 추가:

- `AWS_ACCESS_KEY_ID`: AWS 액세스 키 ID
- `AWS_SECRET_ACCESS_KEY`: AWS 시크릿 액세스 키
- `S3_BUCKET_NAME`: S3 버킷 이름
- `CLOUDFRONT_DIST_ID`: CloudFront 배포 ID
- `GEMINI_API_KEY`: Google Gemini API 키

## 4. GitHub Pages 설정 (무료 호스팅)

### 정적 사이트 호스팅
1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, /(root)
4. Save

### 커스텀 도메인 (선택사항)
1. Custom domain에 도메인 입력
2. DNS 설정:
   ```
   A     @     185.199.108.153
   A     @     185.199.109.153
   A     @     185.199.110.153
   A     @     185.199.111.153
   CNAME www   YOUR_USERNAME.github.io
   ```

## 5. 협업 설정

### 팀원 초대
1. Settings → Manage access
2. Invite a collaborator
3. 권한 레벨 선택:
   - **Write**: 코드 푸시 가능
   - **Maintain**: 설정 변경 가능
   - **Admin**: 전체 관리 권한

### Branch Protection Rules
1. Settings → Branches
2. Add rule
3. Branch name pattern: `main`
4. 보호 규칙:
   - ✅ Require pull request reviews
   - ✅ Dismiss stale pull request approvals
   - ✅ Require status checks
   - ✅ Include administrators

## 6. 이슈 템플릿 설정

### Bug Report Template
`.github/ISSUE_TEMPLATE/bug_report.md`:
```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**버그 설명**
버그에 대한 명확하고 간결한 설명

**재현 방법**
1. '...'로 이동
2. '....'를 클릭
3. '....'까지 스크롤
4. 오류 확인

**예상 동작**
예상했던 동작에 대한 설명

**스크린샷**
해당되는 경우 스크린샷 추가

**환경:**
 - OS: [예: macOS]
 - 브라우저: [예: chrome, safari]
 - 버전: [예: 22]
```

### Feature Request Template
`.github/ISSUE_TEMPLATE/feature_request.md`:
```markdown
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**문제 설명**
해결하려는 문제에 대한 설명

**제안 솔루션**
원하는 솔루션에 대한 설명

**대안**
고려한 대안에 대한 설명

**추가 컨텍스트**
기능 요청에 대한 추가 컨텍스트나 스크린샷
```

## 7. Pull Request 템플릿

`.github/pull_request_template.md`:
```markdown
## 📋 PR 체크리스트
- [ ] 코드가 프로젝트 스타일 가이드를 따름
- [ ] 셀프 리뷰 완료
- [ ] 코드에 주석 추가 (특히 복잡한 부분)
- [ ] 문서 업데이트 완료
- [ ] 변경사항이 기존 테스트를 깨뜨리지 않음
- [ ] 새로운 테스트 추가 (해당하는 경우)

## 🎯 변경 사항
변경 사항에 대한 간단한 설명

## 🔗 관련 이슈
Fixes #(issue)

## 📸 스크린샷 (해당하는 경우)
UI 변경사항이 있다면 스크린샷 추가
```

## 8. 프로젝트 보드 설정

1. Projects 탭 → New project
2. Template: Basic kanban
3. 컬럼 설정:
   - 📋 Backlog
   - 🚀 In Progress  
   - 👀 Review
   - ✅ Done

## 9. Wiki 설정 (문서화)

1. Wiki 탭 활성화
2. Home 페이지 생성
3. 주요 문서:
   - Getting Started
   - API Documentation
   - Deployment Guide
   - Contributing Guidelines

## 10. 유용한 Git 명령어

```bash
# 브랜치 생성 및 전환
git checkout -b feature/new-feature

# 변경사항 스테이징
git add .

# 커밋
git commit -m "feat: 새로운 기능 추가"

# 원격 저장소에 푸시
git push origin feature/new-feature

# main 브랜치와 병합
git checkout main
git merge feature/new-feature

# 태그 생성
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# 원격 저장소 동기화
git fetch origin
git pull origin main
```

## 🔐 보안 주의사항

- **절대 하지 마세요**:
  - API 키를 코드에 하드코딩
  - .env 파일을 커밋
  - AWS 크레덴셜을 공개
  
- **항상 하세요**:
  - .gitignore 파일 확인
  - GitHub Secrets 사용
  - 민감한 정보는 환경변수로

---

**준비되셨나요?** 🎉 
이제 GitHub에 코드를 푸시하고 협업을 시작하세요!