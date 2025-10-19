// Menu functionality verification script
// Run this in the browser console to test all menu functions

console.log("=== 메뉴 기능 테스트 시작 ===");

// Test navigation functions
const testFunctions = [
    'showTab',
    'toggleSection', 
    'updateDashboard',
    'refreshInsights',
    'analyzeCurrentTrends',
    'generateTitle',
    'generateFromTemplate',
    'changeTone',
    'checkSEO',
    'startFactCheck',
    'loadPosts'
];

let passedTests = 0;
let totalTests = testFunctions.length;

testFunctions.forEach(funcName => {
    try {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} - 함수가 정의되어 있습니다.`);
            passedTests++;
        } else {
            console.log(`❌ ${funcName} - 함수가 정의되지 않았습니다.`);
        }
    } catch (error) {
        console.log(`❌ ${funcName} - 오류: ${error.message}`);
    }
});

console.log(`\n=== 테스트 결과: ${passedTests}/${totalTests} 통과 ===`);

// Test tab switching
console.log("\n=== 탭 전환 테스트 ===");
const tabs = ['overview', 'insights', 'analytics', 'trends', 'smart-write', 'templates', 'tone-manager', 'fact-check', 'seo-optimizer', 'posts'];

tabs.forEach(tab => {
    try {
        showTab(tab);
        const panel = document.getElementById(`${tab}-panel`);
        if (panel && panel.classList.contains('active')) {
            console.log(`✅ ${tab} 탭 - 정상 전환`);
        } else {
            console.log(`❌ ${tab} 탭 - 전환 실패`);
        }
    } catch (error) {
        console.log(`❌ ${tab} 탭 - 오류: ${error.message}`);
    }
});

console.log("\n=== 메뉴 테스트 완료 ===");