let mediaRecorder;
let audioChunks = [];
let isRecording = false;

async function toggleRecording() {
    const recordBtn = document.getElementById('voice-record-btn');
    const statusDiv = document.getElementById('voice-status');
    const resultDiv = document.getElementById('voice-result');

    if (isRecording) {
        // Stop recording
        mediaRecorder.stop();
        isRecording = false;
        recordBtn.innerHTML = '<i class="fas fa-microphone"></i> 녹음 시작';
        recordBtn.classList.remove('recording');
        statusDiv.innerHTML = '<p>녹음이 중지되었습니다. AI가 텍스트로 변환 중입니다...</p>';
        return;
    }

    // Start recording
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = []; // Reset for next recording

            const formData = new FormData();
            formData.append('audio_file', audioBlob, 'recording.webm');

            try {
                const response = await fetch('http://localhost:8001/api/ai/transcribe-audio', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                resultDiv.innerHTML = `<p>${data.transcription}</p>`;
                statusDiv.innerHTML = '<p>텍스트 변환이 완료되었습니다. 다시 녹음하려면 버튼을 누르세요.</p>';

            } catch (error) {
                console.error('Error transcribing audio:', error);
                resultDiv.innerHTML = `<p style="color: red;">음성 변환에 실패했습니다. 백엔드 서버 연결을 확인해주세요.</p>`;
            }
        };

        mediaRecorder.start();
        isRecording = true;
        recordBtn.innerHTML = '<i class="fas fa-stop-circle"></i> 녹음 중지';
        recordBtn.classList.add('recording'); // Add a class for styling
        statusDiv.innerHTML = '<p style="color: #e74c3c;">녹음이 진행 중입니다... 다시 버튼을 누르면 중지됩니다.</p>';
        resultDiv.innerHTML = '<p style="color: #999;">음성으로 변환된 텍스트가 여기에 표시됩니다.</p>';

    } catch (err) {
        console.error('Error accessing microphone:', err);
        statusDiv.innerHTML = '<p style="color: red;">마이크에 접근할 수 없습니다. 브라우저의 마이크 권한을 확인해주세요.</p>';
    }
}
