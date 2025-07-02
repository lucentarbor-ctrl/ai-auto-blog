// 강좌 데이터 관리
const courseData = {
    notion: {
        name: '노션 마스터 클래스',
        path: '../notion-course/lessons/',
        icon: 'fa-sticky-note',
        color: '#000',
        totalLessons: 30,
        lessons: [
            { id: 1, title: '나의 첫 페이지 - 인터페이스와 블록 개념', module: '모듈 1' },
            { id: 2, title: '기본 블록 마스터하기 - 생각의 구조화', module: '모듈 1' },
            { id: 3, title: '페이지 운영 - 중첩, 연결, 공유', module: '모듈 1' },
            { id: 4, title: '강조의 기술 - 서식, 색상, 콜아웃', module: '모듈 1' },
            { id: 5, title: '필수 단축키와 마크다운 완전 정복', module: '모듈 1' },
            { id: 6, title: '모듈 1 복습 및 미니 프로젝트', module: '모듈 1' },
            { id: 7, title: '시각적 레이아웃 만들기 - 다단과 구분선', module: '모듈 2' },
            { id: 8, title: '페이지에 생명 불어넣기 - 아이콘, 커버, 미디어', module: '모듈 2' },
            { id: 9, title: '결정적 전환 - 데이터베이스 입문', module: '모듈 2' },
            { id: 10, title: '데이터베이스 보기 둘러보기 - 데이터 시각화', module: '모듈 2' },
            { id: 11, title: '고급 블록 활용 - 버튼, 동기화 블록, 목차', module: '모듈 2' },
            { id: 12, title: '모듈 2 복습 및 미니 프로젝트', module: '모듈 2' },
            { id: 13, title: '데이터베이스 속성 심층 분석', module: '모듈 3' },
            { id: 14, title: '보기 마스터하기 - 필터, 정렬, 그룹', module: '모듈 3' },
            { id: 15, title: '세상을 연결하다 - 관계형 속성', module: '모듈 3' },
            { id: 16, title: '데이터 집계하기 - 롤업 속성', module: '모듈 3' },
            { id: 17, title: '워크플로우 자동화 - 데이터베이스 템플릿', module: '모듈 3' },
            { id: 18, title: '모듈 3 복습 및 미니 프로젝트', module: '모듈 3' },
            { id: 19, title: 'Notion Formula 2.0 입문', module: '모듈 4' },
            { id: 20, title: '필수 수식 함수와 논리', module: '모듈 4' },
            { id: 21, title: 'let, map, filter를 활용한 고급 수식', module: '모듈 4' },
            { id: 22, title: '노션 자동화 입문', module: '모듈 4' },
            { id: 23, title: 'API, Zapier, Make.com으로 노션 확장하기', module: '모듈 4' },
            { id: 24, title: '모듈 4 복습 및 미니 프로젝트', module: '모듈 4' },
            { id: 25, title: 'PARA 메소드로 세컨드 브레인 구축하기 (1부)', module: '모듈 5' },
            { id: 26, title: 'PARA 메소드로 세컨드 브레인 구축하기 (2부)', module: '모듈 5' },
            { id: 27, title: 'GTD로 생산성 마스터하기 (1부)', module: '모듈 5' },
            { id: 28, title: 'GTD로 생산성 마스터하기 (2부)', module: '모듈 5' },
            { id: 29, title: '노션 AI 활용하기', module: '모듈 5' },
            { id: 30, title: '협업 - 팀 위키 구축하기', module: '모듈 5' }
        ]
    },
    obsidian: {
        name: '옵시디언 마스터 클래스',
        path: '../obsidian_course/',
        icon: 'fa-gem',
        color: '#7c3aed',
        totalLessons: 35,
        lessons: [
            { id: 1, title: '옵시디언 첫걸음', module: '초급' },
            { id: 2, title: '볼트(Vault)의 이해', module: '초급' },
            { id: 3, title: '기본 노트 작성', module: '초급' },
            { id: 4, title: '내부 링크의 마법', module: '초급' },
            { id: 5, title: '태그와 속성', module: '초급' },
            { id: 6, title: '일일 노트와 템플릿', module: '초급' },
            { id: 7, title: '파일 임베드와 트랜스클루전', module: '초급' },
            { id: 8, title: '검색과 필터링', module: '초급' },
            { id: 9, title: '그래프 뷰 기초', module: '초급' },
            { id: 10, title: '필수 커뮤니티 플러그인', module: '초급' },
            { id: 11, title: 'Dataview 플러그인 마스터', module: '중급' },
            { id: 12, title: 'Templater 고급 템플릿', module: '중급' },
            { id: 13, title: 'Tasks로 할 일 관리', module: '중급' },
            { id: 14, title: '캔버스로 시각적 사고', module: '중급' },
            { id: 15, title: 'Excalidraw로 그리기', module: '중급' },
            { id: 16, title: 'PKM 시스템 구축', module: '중급' },
            { id: 17, title: 'Zettelkasten 구현', module: '중급' },
            { id: 18, title: '두 번째 뇌 만들기', module: '중급' },
            { id: 19, title: '고급 검색과 쿼리', module: '중급' },
            { id: 20, title: '워크플로우 자동화', module: '중급' },
            { id: 21, title: 'Git으로 버전 관리', module: '고급' },
            { id: 22, title: '모바일 동기화', module: '고급' },
            { id: 23, title: 'Obsidian Publish', module: '고급' },
            { id: 24, title: 'API와 플러그인 개발', module: '고급' },
            { id: 25, title: 'CSS 커스터마이징', module: '고급' },
            { id: 26, title: '고급 Dataview', module: '고급' },
            { id: 27, title: '연구와 논문 작성', module: '고급' },
            { id: 28, title: '팀 협업', module: '고급' },
            { id: 29, title: '성능 최적화', module: '고급' },
            { id: 30, title: '통합 워크플로우', module: '고급' },
            { id: 31, title: 'AI와 옵시디언', module: '보너스' },
            { id: 32, title: '특수 용도별 설정', module: '보너스' },
            { id: 33, title: '커뮤니티와 리소스', module: '보너스' },
            { id: 34, title: '마이그레이션 가이드', module: '보너스' },
            { id: 35, title: '미래를 위한 옵시디언', module: '보너스' }
        ]
    },
    evoto: {
        name: 'Evoto 마스터 클래스',
        path: '../evoto-master-class/',
        icon: 'fa-camera',
        color: '#ff6b6b',
        totalLessons: 40,
        lessons: [
            { id: 1, title: 'Evoto와의 첫 만남', module: '모듈 1' },
            { id: 2, title: '설치와 환경 설정', module: '모듈 1' },
            { id: 3, title: '인터페이스 완벽 정복', module: '모듈 1' },
            { id: 4, title: 'AI의 마법', module: '모듈 1' },
            { id: 5, title: '첫 인물 사진 리터칭', module: '모듈 1' },
            { id: 6, title: '피부 보정의 예술', module: '모듈 2' },
            { id: 7, title: '얼굴 형태와 비율', module: '모듈 2' },
            { id: 8, title: '눈, 코, 입 디테일', module: '모듈 2' },
            { id: 9, title: '디지털 메이크업', module: '모듈 2' },
            { id: 10, title: '다양한 피부톤 리터칭', module: '모듈 2' },
            { id: 11, title: '체형 보정의 기본', module: '모듈 3' },
            { id: 12, title: '자연스러운 슬림화', module: '모듈 3' },
            { id: 13, title: '자세와 포즈 교정', module: '모듈 3' },
            { id: 14, title: '의상과 액세서리', module: '모듈 3' },
            { id: 15, title: '전신 샷 프로젝트', module: '모듈 3' },
            { id: 16, title: 'AI 배경 분리', module: '모듈 4' },
            { id: 17, title: '배경 블러와 보케', module: '모듈 4' },
            { id: 18, title: '배경 교체와 합성', module: '모듈 4' },
            { id: 19, title: '색상 그레이딩', module: '모듈 4' },
            { id: 20, title: '스튜디오 조명 효과', module: '모듈 4' },
            { id: 21, title: '프리셋 제작과 관리', module: '모듈 5' },
            { id: 22, title: '배치 프로세싱', module: '모듈 5' },
            { id: 23, title: '스마트 워크플로우', module: '모듈 5' },
            { id: 24, title: '단축키 마스터', module: '모듈 5' },
            { id: 25, title: '웨딩 사진 대량 처리', module: '모듈 5' },
            { id: 26, title: '그룹 사진 리터칭', module: '모듈 6' },
            { id: 27, title: '야외 촬영 보정', module: '모듈 6' },
            { id: 28, title: '극한 조명 대처법', module: '모듈 6' },
            { id: 29, title: '빈티지/필름 스타일', module: '모듈 6' },
            { id: 30, title: '예술적 리터칭', module: '모듈 6' },
            { id: 31, title: '가격 책정 전략', module: '모듈 7' },
            { id: 32, title: '클라이언트 관리', module: '모듈 7' },
            { id: 33, title: '포트폴리오 구축', module: '모듈 7' },
            { id: 34, title: '온라인 서비스', module: '모듈 7' },
            { id: 35, title: '비즈니스 자동화', module: '모듈 7' },
            { id: 36, title: '패션 리터칭', module: '모듈 8' },
            { id: 37, title: '뷰티 리터칭', module: '모듈 8' },
            { id: 38, title: '상업 광고', module: '모듈 8' },
            { id: 39, title: '창의적 편집', module: '모듈 8' },
            { id: 40, title: '나만의 스타일', module: '모듈 8' }
        ]
    }
};

// 강좌 데이터를 글 목록 형태로 변환
function convertCoursesToPosts() {
    const posts = [];
    
    Object.keys(courseData).forEach(courseKey => {
        const course = courseData[courseKey];
        
        course.lessons.forEach(lesson => {
            const lessonNum = lesson.id.toString().padStart(2, '0');
            posts.push({
                id: `${courseKey}_${lesson.id}`,
                title: `[${course.name}] 제${lesson.id}강: ${lesson.title}`,
                category: course.name,
                categoryIcon: course.icon,
                categoryColor: course.color,
                module: lesson.module,
                lessonNumber: lesson.id,
                path: `${course.path}lesson${lessonNum}.html`,
                type: 'course',
                views: Math.floor(Math.random() * 1000) + 100, // 시뮬레이션된 조회수
                created: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        });
    });
    
    return posts;
}