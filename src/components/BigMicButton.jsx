'use client';

import { useState, useRef } from 'react';

export default function BigMicButton({ onRecordingComplete, isProcessing, isAiReady }) {
  // isAiReady: false = AI model still loading (Cold Start). true = ready to receive voice.
  const [isRecording, setIsRecording] = useState(false);
  const [isToggling, setIsToggling] = useState(false); // Rapid-fire click lock
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const toggleRecording = async () => {
    if (!isAiReady || isToggling) return; // Non-blocking — ignore if spam-clicked or AI cold
    setIsToggling(true);
    
    try {
      if (isRecording) {
        stopRecording();
      } else {
        await startRecording();
      }
    } finally {
      // Small debounce before allowing next click
      setTimeout(() => setIsToggling(false), 300);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access is required to use this feature.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        type="button"
        onClick={toggleRecording}
        disabled={isProcessing || !isAiReady}
        title={!isAiReady ? 'Warming up AI... please wait' : (isRecording ? 'Tap to stop recording' : 'Tap to speak')}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: isRecording ? '#dc2626' : (!isAiReady || isProcessing) ? '#9ca3af' : '#2d6a4f',
          color: 'white',
          border: 'none',
          boxShadow: isRecording 
            ? '0 0 15px rgba(220, 38, 38, 0.5)' 
            : '0 4px 8px rgba(0,0,0,0.1)',
          cursor: (!isAiReady || isProcessing) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ fontSize: '24px' }}>
          {!isAiReady ? '🧠' : isProcessing ? '⏳' : (isRecording ? '⏹️' : '🎤')}
        </div>
        <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
          {!isAiReady ? 'Warming up' : isRecording ? 'Stop' : (isProcessing ? '...' : 'Speak')}
        </div>
      </button>

      {isRecording && (
        <div style={{ marginTop: '30px', position: 'absolute', transform: 'scale(1.5)' }}>
          <div style={{ display: 'flex', gap: '3px' }}>
            <div className="audio-wave-mini"></div>
            <div className="audio-wave-mini" style={{ animationDelay: '0.2s' }}></div>
            <div className="audio-wave-mini" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <style>{`
            .audio-wave-mini {
              width: 3px; height: 10px;
              background-color: #dc2626;
              animation: wave-mini 0.8s infinite alternate;
            }
            @keyframes wave-mini { 0% { height: 5px; } 100% { height: 15px; } }
          `}</style>
        </div>
      )}
    </div>
  );
}
