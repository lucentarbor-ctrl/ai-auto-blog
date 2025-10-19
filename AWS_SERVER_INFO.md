# AWS EC2 서버 접속 정보

## 서버 정보
- **인스턴스 ID**: i-04dd80ba44c142706
- **인스턴스 이름**: ai-auto-blog-server
- **인스턴스 타입**: t2.micro (프리티어)
- **Public IP**: 3.34.5.55
- **Private IP**: 172.31.38.194
- **리전**: ap-northeast-2 (서울)
- **가용 영역**: ap-northeast-2c
- **생성 시간**: 2025-10-19T14:43:28.000Z

## SSH 접속 방법
```bash
ssh -i ~/lucentarbor-blog-key.pem ec2-user@3.34.5.55
```

## SSH 키 정보
- **키 이름**: lucentarbor-blog-key
- **키 파일 위치**: ~/lucentarbor-blog-key.pem
- **권한**: 600 (읽기 전용)

## 보안 그룹 (ai-blog-sg)
- **그룹 ID**: sg-0831ae4afa60ac0ef
- **열린 포트**:
  - 22 (SSH)
  - 80 (HTTP)
  - 3000 (Node.js)
  - 5000 (Flask)

## AWS 계정 정보
- **AWS Account ID**: 757720325826
- **IAM User**: lucentarbor
- **Default Region**: ap-northeast-2

> ⚠️ AWS Access Key와 Secret Key는 보안을 위해 별도로 안전하게 보관하세요!

## 서버 접속 URL
- **HTTP**: http://3.34.5.55
- **Node.js App**: http://3.34.5.55:3000
- **Flask API**: http://3.34.5.55:5000

## 주의사항
1. 이 파일은 GitHub에 안전하게 푸시할 수 있습니다 (인증정보 미포함)
2. AWS 인증정보는 절대 GitHub에 올리지 마세요
3. t2.micro는 AWS 프리티어로 첫 1년간 월 750시간 무료입니다
4. 24시간 켜놔도 무료이지만, 1년 후에는 과금됩니다

## 다음 단계
1. SSH로 서버 접속
2. Node.js, Python 등 필요한 환경 설치
3. ai-auto-blog 프로젝트 클론 및 실행
4. 도메인 연결 (선택사항)

---
생성일: 2025-10-19