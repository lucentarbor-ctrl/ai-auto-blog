# AWS 접속 정보 및 설정 가이드 📡

## 🔐 AWS 계정 정보

### IAM 사용자 생성
1. AWS 콘솔 로그인 후 IAM 서비스로 이동
2. Users → Add users 클릭
3. User name: `ai-blog-admin`
4. Access type: Programmatic access ✓

### 필요한 권한 정책
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "ec2:*",
        "cloudfront:*",
        "iam:ListAccessKeys",
        "iam:CreateAccessKey"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🖥 EC2 인스턴스 설정

### 인스턴스 생성
- **Instance Type**: `t3.medium` (2 vCPU, 4 GB Memory)
- **AMI**: Ubuntu Server 22.04 LTS (HVM)
- **Storage**: 30 GB gp3
- **Region**: `ap-northeast-2` (Seoul)

### 보안 그룹 설정
```
인바운드 규칙:
- SSH (22): Your IP
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom TCP (3000): 0.0.0.0/0  # Node.js 앱
- Custom TCP (11434): 0.0.0.0/0  # Ollama
```

### 키 페어 생성
```bash
# 로컬에서 키 생성
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ai-blog-key

# 권한 설정
chmod 400 ~/.ssh/ai-blog-key
```

### SSH 접속
```bash
ssh -i ~/.ssh/ai-blog-key ubuntu@<EC2-PUBLIC-IP>
```

## 🪣 S3 버킷 설정

### 버킷 생성
```bash
# AWS CLI로 버킷 생성
aws s3 mb s3://ai-blog-content --region ap-northeast-2
```

### 버킷 정책 (공개 읽기용)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ai-blog-content/*"
    }
  ]
}
```

### 정적 웹사이트 호스팅 설정
```bash
aws s3 website s3://ai-blog-content \
  --index-document index.html \
  --error-document error.html
```

## ⚡ CloudFront 설정

### 배포 생성
```bash
aws cloudfront create-distribution \
  --origin-domain-name ai-blog-content.s3.amazonaws.com \
  --default-root-object index.html
```

### 캐싱 정책
- HTML: 5분
- JS/CSS: 1일
- 이미지: 7일

## 🚀 자동 배포 설정

### GitHub Actions 워크플로우
`.github/workflows/deploy.yml`:
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2
      
      - name: Deploy to S3
        run: |
          aws s3 sync ./frontend s3://ai-blog-content --delete
          
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DIST_ID }} \
            --paths "/*"
```

## 📊 모니터링 설정

### CloudWatch 알람
```bash
# CPU 사용률 알람
aws cloudwatch put-metric-alarm \
  --alarm-name high-cpu-usage \
  --alarm-description "Alarm when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### 로그 수집
```bash
# CloudWatch Logs Agent 설치
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

## 💰 비용 관리

### 예상 월 비용
- EC2 t3.medium: ~$35/월
- S3 (100GB): ~$3/월
- CloudFront (100GB 전송): ~$10/월
- **총 예상 비용**: ~$48/월

### 비용 절감 팁
1. Reserved Instances 사용 (최대 72% 절감)
2. Spot Instances 활용 (개발 환경)
3. S3 Intelligent-Tiering 활성화
4. CloudFront 캐싱 최적화

## 🔧 유용한 AWS CLI 명령어

```bash
# EC2 인스턴스 목록
aws ec2 describe-instances --query "Reservations[].Instances[].{ID:InstanceId,Type:InstanceType,State:State.Name}"

# S3 버킷 목록
aws s3 ls

# CloudFront 배포 목록
aws cloudfront list-distributions

# 비용 확인 (이번 달)
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

## 🚨 문제 해결

### EC2 접속 불가
```bash
# 보안 그룹 확인
aws ec2 describe-security-groups --group-ids <security-group-id>

# 인스턴스 상태 확인
aws ec2 describe-instance-status --instance-ids <instance-id>
```

### S3 업로드 실패
```bash
# 버킷 권한 확인
aws s3api get-bucket-acl --bucket ai-blog-content

# IAM 권한 확인
aws iam get-user-policy --user-name ai-blog-admin --policy-name S3FullAccess
```

## 📱 AWS 모바일 앱 설정

1. AWS Console 앱 다운로드 (iOS/Android)
2. MFA 설정으로 보안 강화
3. 주요 알람 설정으로 실시간 모니터링

## 🔄 백업 전략

### 자동 백업
```bash
# EC2 스냅샷 생성 (매일 새벽 3시)
0 3 * * * aws ec2 create-snapshot --volume-id <volume-id> --description "Daily backup $(date +\%Y-\%m-\%d)"

# S3 버킷 복제
aws s3 sync s3://ai-blog-content s3://ai-blog-backup --delete
```

### 재해 복구
- RPO (Recovery Point Objective): 24시간
- RTO (Recovery Time Objective): 2시간
- 다중 리전 백업 권장

---

**⚠️ 보안 주의사항**
- AWS 키는 절대 코드에 하드코딩하지 마세요
- 정기적으로 액세스 키 교체
- MFA 반드시 활성화
- 최소 권한 원칙 적용