let v2p_mediaRecorder;
let v2p_audioChunks = [];
let v2p_isRecording = false;
let v2p_transcribedText = "";

async function v2p_toggleRecording() {
    const recordBtn = document.getElementById('v2p-record-btn');
    const statusDiv = document.getElementById('v2p-status');
    const resultDiv = document.getElementById('v2p-result');
    const sendBtn = document.getElementById('v2p-send-btn');

    sendBtn.style.display = 'none';

    if (v2p_isRecording) {
        // Stop recording
        v2p_mediaRecorder.stop();
        v2p_isRecording = false;
        recordBtn.innerHTML = '<i class="fas fa-microphone-alt"></i> 포스트 내용 녹음 시작';
        recordBtn.disabled = true; // Disable until processing is done
        statusDiv.innerHTML = '<p>녹음이 중지되었습니다. AI가 텍스트로 변환 중입니다...</p>';
        return;
    }

    // Start recording
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        v2p_mediaRecorder = new MediaRecorder(stream);

        v2p_mediaRecorder.ondataavailable = event => {
            v2p_audioChunks.push(event.data);
        };

        v2p_mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(v2p_audioChunks, { type: 'audio/webm' });
            v2p_audioChunks = []; // Reset for next recording

            const formData = new FormData();
            formData.append('audio_file', audioBlob, 'recording.webm');

            try {
                const response = await fetch('http://localhost:8001/api/ai/transcribe-audio', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                v2p_transcribedText = data.transcription;
                resultDiv.innerHTML = `<p>${v2p_transcribedText}</p>`;
                statusDiv.innerHTML = '<p>텍스트 변환이 완료되었습니다. 에디터로 보내거나, 다시 녹음할 수 있습니다.</p>';
                sendBtn.style.display = 'inline-flex'; // Show the send button

            } catch (error) {
                console.error('Error transcribing audio:', error);
                resultDiv.innerHTML = `<p style="color: red;">음성 변환에 실패했습니다.</p>`;
            } finally {
                recordBtn.disabled = false; // Re-enable button
            }
        };

        v2p_mediaRecorder.start();
        v2p_isRecording = true;
        recordBtn.innerHTML = '<i class="fas fa-stop-circle"></i> 녹음 중지';
        statusDiv.innerHTML = '<p style="color: #e74c3c;">녹음이 진행 중입니다...</p>';
        resultDiv.innerHTML = '<p style="color: #999;">음성으로 변환된 텍스트가 여기에 표시됩니다.</p>';

    } catch (err) {
        console.error('Error accessing microphone:', err);
        statusDiv.innerHTML = '<p style="color: red;">마이크에 접근할 수 없습니다. 브라우저의 마이크 권한을 확인해주세요.</p>';
    }
}

function sendToEditor() {
    if (!v2p_transcribedText) {
        alert("에디터로 보낼 텍스트가 없습니다.");
        return;
    }

    // Use the first sentence as a title, the rest as content
    const sentences = v2p_transcribedText.split('.');
    const title = sentences.shift() || v2p_transcribedText.substring(0, 50);
    const content = sentences.join('.').trim();

    showTab('smart-write');
    document.getElementById('smartPostTitle').value = title;
    document.getElementById('smartPostContent').innerHTML = `<p>${content}</p>`;
    showToast('음성 메모를 스마트 에디터로 보냈습니다.');
}
