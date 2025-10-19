async function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const resultTextarea = document.getElementById('report-result');

    if (!reportType) {
        alert('보고서 종류를 선택해주세요.');
        return;
    }

    resultTextarea.value = 'AI가 보고서를 생성 중입니다...';

    try {
        const response = await fetch('http://localhost:8001/api/analytics/generate-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ report_type: reportType }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        resultTextarea.value = data.report;

    } catch (error) {
        console.error('Error generating report:', error);
        resultTextarea.value = `보고서 생성에 실패했습니다: ${error.message}`;
    }
}
