// A/B 테스팅 시스템
class ABTestingManager {
    constructor() {
        this.tests = this.loadTests();
        this.results = this.loadResults();
        this.activeTests = new Map();
    }
    
    // 새 A/B 테스트 생성
    createTest(name, config = {}) {
        const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const test = {
            id: testId,
            name,
            createdAt: new Date().toISOString(),
            status: 'active',
            config: {
                prompt: config.prompt || '',
                modelA: config.modelA || null,
                modelB: config.modelB || null,
                sampleSize: config.sampleSize || 10,
                evaluationCriteria: config.criteria || ['quality', 'speed', 'coherence'],
                autoStop: config.autoStop || false,
                confidenceLevel: config.confidenceLevel || 0.95
            },
            results: {
                modelA: {
                    runs: [],
                    votes: 0,
                    totalTime: 0,
                    totalCost: 0,
                    errors: 0
                },
                modelB: {
                    runs: [],
                    votes: 0,
                    totalTime: 0,
                    totalCost: 0,
                    errors: 0
                }
            }
        };
        
        this.tests[testId] = test;
        this.activeTests.set(testId, test);
        this.saveTests();
        
        return test;
    }
    
    // 테스트 실행
    async runTest(testId, iterations = 1) {
        const test = this.tests[testId];
        if (!test || test.status !== 'active') {
            throw new Error('테스트를 찾을 수 없거나 비활성 상태입니다');
        }
        
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            // 프롬프트 변형 (선택적)
            const prompt = this.generatePromptVariation(test.config.prompt, i);
            
            // 병렬로 두 모델 실행
            const [resultA, resultB] = await Promise.all([
                this.runModel(test.config.modelA, prompt),
                this.runModel(test.config.modelB, prompt)
            ]);
            
            // 결과 저장
            test.results.modelA.runs.push(resultA);
            test.results.modelB.runs.push(resultB);
            
            // 통계 업데이트
            if (!resultA.error) {
                test.results.modelA.totalTime += resultA.duration;
                test.results.modelA.totalCost += resultA.cost;
            } else {
                test.results.modelA.errors++;
            }
            
            if (!resultB.error) {
                test.results.modelB.totalTime += resultB.duration;
                test.results.modelB.totalCost += resultB.cost;
            } else {
                test.results.modelB.errors++;
            }
            
            results.push({ 
                iteration: i + 1,
                modelA: resultA,
                modelB: resultB,
                prompt 
            });
            
            // 자동 중지 검사
            if (test.config.autoStop && this.shouldStopTest(test)) {
                test.status = 'completed';
                console.log('테스트 자동 중지: 통계적 유의성 도달');
                break;
            }
        }
        
        this.saveTests();
        return results;
    }
    
    // 모델 실행
    async runModel(modelId, prompt) {
        try {
            const startTime = Date.now();
            const result = await window.multiAI.generateContent(prompt, {
                modelId,
                autoSelect: false
            });
            
            return {
                ...result,
                timestamp: new Date().toISOString(),
                success: true
            };
        } catch (error) {
            return {
                error: error.message,
                modelId,
                duration: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                success: false
            };
        }
    }
    
    // 프롬프트 변형 생성
    generatePromptVariation(basePrompt, iteration) {
        // 기본적으로는 동일한 프롬프트 사용
        // 필요시 변형 로직 추가 가능
        return basePrompt;
    }
    
    // 투표 (사용자 평가)
    vote(testId, winner, criteria = 'overall') {
        const test = this.tests[testId];
        if (!test) return;
        
        if (winner === 'modelA') {
            test.results.modelA.votes++;
        } else if (winner === 'modelB') {
            test.results.modelB.votes++;
        }
        
        // 세부 평가 저장
        if (!test.results.criteriaVotes) {
            test.results.criteriaVotes = {};
        }
        if (!test.results.criteriaVotes[criteria]) {
            test.results.criteriaVotes[criteria] = { modelA: 0, modelB: 0 };
        }
        test.results.criteriaVotes[criteria][winner]++;
        
        this.saveTests();
    }
    
    // 통계 분석
    analyzeResults(testId) {
        const test = this.tests[testId];
        if (!test) return null;
        
        const analysis = {
            testId,
            name: test.name,
            status: test.status,
            totalRuns: test.results.modelA.runs.length,
            
            modelA: {
                name: window.multiAI.models[test.config.modelA]?.name || test.config.modelA,
                votes: test.results.modelA.votes,
                avgTime: test.results.modelA.totalTime / test.results.modelA.runs.length || 0,
                avgCost: test.results.modelA.totalCost / test.results.modelA.runs.length || 0,
                errorRate: test.results.modelA.errors / test.results.modelA.runs.length || 0,
                successRate: 1 - (test.results.modelA.errors / test.results.modelA.runs.length || 0)
            },
            
            modelB: {
                name: window.multiAI.models[test.config.modelB]?.name || test.config.modelB,
                votes: test.results.modelB.votes,
                avgTime: test.results.modelB.totalTime / test.results.modelB.runs.length || 0,
                avgCost: test.results.modelB.totalCost / test.results.modelB.runs.length || 0,
                errorRate: test.results.modelB.errors / test.results.modelB.runs.length || 0,
                successRate: 1 - (test.results.modelB.errors / test.results.modelB.runs.length || 0)
            }
        };
        
        // 승자 결정
        analysis.winner = this.determineWinner(test);
        
        // 통계적 유의성 계산
        analysis.statistical = this.calculateStatisticalSignificance(test);
        
        // 개선 퍼센티지
        if (analysis.modelA.avgTime > 0 && analysis.modelB.avgTime > 0) {
            analysis.speedImprovement = ((analysis.modelA.avgTime - analysis.modelB.avgTime) / analysis.modelA.avgTime * 100).toFixed(1);
        }
        
        if (analysis.modelA.avgCost > 0 && analysis.modelB.avgCost > 0) {
            analysis.costImprovement = ((analysis.modelA.avgCost - analysis.modelB.avgCost) / analysis.modelA.avgCost * 100).toFixed(1);
        }
        
        return analysis;
    }
    
    // 승자 결정
    determineWinner(test) {
        const votesA = test.results.modelA.votes;
        const votesB = test.results.modelB.votes;
        
        if (votesA === votesB) {
            // 동점일 경우 다른 지표 고려
            const scoreA = this.calculateCompositeScore(test.results.modelA);
            const scoreB = this.calculateCompositeScore(test.results.modelB);
            
            if (scoreA > scoreB) return 'modelA';
            if (scoreB > scoreA) return 'modelB';
            return 'tie';
        }
        
        return votesA > votesB ? 'modelA' : 'modelB';
    }
    
    // 종합 점수 계산
    calculateCompositeScore(results) {
        const runs = results.runs.filter(r => !r.error);
        if (runs.length === 0) return 0;
        
        const avgTime = results.totalTime / runs.length;
        const avgCost = results.totalCost / runs.length;
        const successRate = runs.length / results.runs.length;
        
        // 가중치: 성공률 40%, 속도 35%, 비용 25%
        const timeScore = Math.max(0, 100 - (avgTime / 100)); // 100ms = 0점
        const costScore = Math.max(0, 100 - (avgCost * 10000)); // $0.01 = 0점
        const successScore = successRate * 100;
        
        return successScore * 0.4 + timeScore * 0.35 + costScore * 0.25;
    }
    
    // 통계적 유의성 계산
    calculateStatisticalSignificance(test) {
        const n = test.results.modelA.votes + test.results.modelB.votes;
        if (n < 10) return { significant: false, confidence: 0, message: '샘플 수 부족' };
        
        const pA = test.results.modelA.votes / n;
        const pB = test.results.modelB.votes / n;
        
        // 이항 검정 간단 버전
        const z = Math.abs(pA - pB) / Math.sqrt((pA * (1 - pA) + pB * (1 - pB)) / n);
        const confidence = this.zToConfidence(z);
        
        return {
            significant: confidence >= test.config.confidenceLevel,
            confidence: confidence,
            zScore: z,
            message: confidence >= test.config.confidenceLevel ? 
                '통계적으로 유의미한 차이' : '통계적으로 유의미하지 않음'
        };
    }
    
    // Z-score를 신뢰도로 변환
    zToConfidence(z) {
        // 간단한 근사
        if (z < 1.645) return 0.90;
        if (z < 1.96) return 0.95;
        if (z < 2.576) return 0.99;
        return 0.999;
    }
    
    // 테스트 자동 중지 여부 결정
    shouldStopTest(test) {
        const analysis = this.analyzeResults(test.id);
        
        // 통계적 유의성 도달
        if (analysis.statistical.significant) {
            return true;
        }
        
        // 명확한 승자 (2배 이상 차이)
        if (test.results.modelA.votes > test.results.modelB.votes * 2 ||
            test.results.modelB.votes > test.results.modelA.votes * 2) {
            return true;
        }
        
        // 최대 샘플 수 도달
        if (test.results.modelA.runs.length >= test.config.sampleSize) {
            return true;
        }
        
        return false;
    }
    
    // 테스트 히스토리
    getTestHistory(limit = 10) {
        return Object.values(this.tests)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit)
            .map(test => ({
                id: test.id,
                name: test.name,
                createdAt: test.createdAt,
                status: test.status,
                totalRuns: test.results.modelA.runs.length,
                winner: this.determineWinner(test),
                analysis: this.analyzeResults(test.id)
            }));
    }
    
    // 비교 리포트 생성
    generateComparisonReport(testId) {
        const analysis = this.analyzeResults(testId);
        if (!analysis) return null;
        
        return {
            summary: {
                testName: analysis.name,
                winner: analysis.winner === 'modelA' ? analysis.modelA.name : analysis.modelB.name,
                confidence: analysis.statistical.confidence,
                totalRuns: analysis.totalRuns
            },
            
            performance: {
                speed: {
                    modelA: analysis.modelA.avgTime + 'ms',
                    modelB: analysis.modelB.avgTime + 'ms',
                    improvement: analysis.speedImprovement + '%'
                },
                cost: {
                    modelA: '$' + analysis.modelA.avgCost.toFixed(6),
                    modelB: '$' + analysis.modelB.avgCost.toFixed(6),
                    improvement: analysis.costImprovement + '%'
                },
                reliability: {
                    modelA: (analysis.modelA.successRate * 100).toFixed(1) + '%',
                    modelB: (analysis.modelB.successRate * 100).toFixed(1) + '%'
                }
            },
            
            userPreference: {
                modelA: analysis.modelA.votes,
                modelB: analysis.modelB.votes,
                ratio: analysis.modelA.votes > 0 ? 
                    (analysis.modelB.votes / analysis.modelA.votes).toFixed(2) : 'N/A'
            },
            
            recommendation: this.generateRecommendation(analysis)
        };
    }
    
    // 추천 생성
    generateRecommendation(analysis) {
        const recommendations = [];
        
        if (analysis.winner === 'tie') {
            recommendations.push('두 모델의 성능이 비슷합니다. 비용을 고려하여 선택하세요.');
        } else {
            const winner = analysis.winner === 'modelA' ? analysis.modelA : analysis.modelB;
            recommendations.push(`${winner.name}이(가) 더 나은 성능을 보입니다.`);
        }
        
        if (Math.abs(parseFloat(analysis.speedImprovement)) > 20) {
            recommendations.push('속도 차이가 크므로 응답 시간이 중요한 경우 고려하세요.');
        }
        
        if (analysis.modelA.errorRate > 0.1 || analysis.modelB.errorRate > 0.1) {
            recommendations.push('오류율이 높은 모델이 있습니다. 안정성 개선이 필요합니다.');
        }
        
        return recommendations;
    }
    
    // 저장/불러오기
    saveTests() {
        localStorage.setItem('ab_tests', JSON.stringify(this.tests));
    }
    
    loadTests() {
        try {
            return JSON.parse(localStorage.getItem('ab_tests') || '{}');
        } catch {
            return {};
        }
    }
    
    saveResults() {
        localStorage.setItem('ab_results', JSON.stringify(this.results));
    }
    
    loadResults() {
        try {
            return JSON.parse(localStorage.getItem('ab_results') || '{}');
        } catch {
            return {};
        }
    }
}

// 전역 인스턴스 생성
window.abTesting = new ABTestingManager();