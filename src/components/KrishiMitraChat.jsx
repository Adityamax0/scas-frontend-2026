'use client';

import { useState, useRef, useEffect } from 'react';
import BigMicButton from './BigMicButton';
import api from '@/lib/api';
import LegalDisclaimer from './LegalDisclaimer';
import { toast } from 'react-hot-toast';

export default function KrishiMitraChat({ onTicketCreated }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Namaste! I am Krishi Mitra, your agricultural assistant. How can I help you today?', time: null }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [displayedText, setDisplayedText] = useState({}); // { messageIndex: currentText }
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [isFirstAIRequest, setIsFirstAIRequest] = useState(true);
  // Cold Start Fix: track whether the AI backend model has finished loading
  // Starts false, becomes true after the first successful AI response (model is now warm)
  const [isAiReady, setIsAiReady] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Fix Hydration Error: Only render time-dependent content on the client
  useEffect(() => {
    setIsMounted(true);
    // Set initial message time on mount
    setMessages(prev => [{ ...prev[0], time: new Date() }]);
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // Magical UX Fix: Auto-refocus the input box immediately after the AI finishes replying
  // (Because when the input is 'disabled' during processing, it permanently loses DOM focus)
  useEffect(() => {
    if (!isProcessing && isOpen && isAiReady) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isProcessing, isOpen, isAiReady]);

  if (!isMounted) return null;

  const addMessage = (role, text, action = null) => {
    setMessages(prev => [...prev, { role, text, action, time: new Date() }]);
  };

  const handleSendText = async (e) => {
    e?.preventDefault();
    const text = inputText;
    setInputText('');
    addMessage('user', text);
    
    // Efficiency: Debounce/Lock prevents multi-submission if user clicks rapidly
    processAIRequest({ text });
    
    // Auto-focus back to input
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleVoiceRecording = async (audioBlob) => {
    processAIRequest({ audio: audioBlob });
  };

  const processAIRequest = async ({ text, audio }) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      if (audio) {
        formData.append('audio', audio, 'voice.wav');
      } else {
        formData.append('text', text);
      }

      const res = await api.post('/audio/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { action, message, transcription } = res.data;

      if (audio && transcription) {
        addMessage('user', transcription);
      }

      // ── PERCEIVED STREAMING (Typewriter Effect) ──
      const messageIndex = messages.length + (audio && transcription ? 1 : 0);
      addMessage('assistant', '', action); // Add empty assistant bubble
      
      let currentIdx = 0;
      const words = message.split(' ');
      const interval = setInterval(() => {
        if (currentIdx >= words.length) {
          clearInterval(interval);
          setMessages(prev => {
            const next = [...prev];
            next[messageIndex].text = message; // Set final text
            return next;
          });
          return;
        }
        
        setMessages(prev => {
          const next = [...prev];
          const currentWords = words.slice(0, currentIdx + 1).join(' ');
          next[messageIndex].text = currentWords + '...';
          return next;
        });
        currentIdx++;
      }, 30); // 30ms per word is a comfortable human reading speed

      // AUTO-SPEAK: Use the component-level autoSpeak state (not 'next[]' which only exists inside setMessages callbacks)
      if (autoSpeak && typeof window !== 'undefined') {
        speakText(message);
      }

      setIsFirstAIRequest(false);
      setIsAiReady(true);

      if (action === 'ticket' && onTicketCreated) {
        onTicketCreated();
      }
    } catch (err) {
      console.error('AI Error:', err);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Auto-detect language (simple regex for Devanagari/Hindi)
    const isHindi = /[\u0900-\u097F]/.test(text);
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9; // Slightly slower for clarity in rural settings
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  const handleVote = async (index, type) => {
    try {
      const msg = messages[index];
      const prevMsg = messages[index - 1]; // The query that triggered this response

      await api.post('/feedback', {
        query: prevMsg?.text || 'N/A',
        aiResponse: msg.text,
        vote: type
      });

      toast.success(type === 'up' ? 'Thanks for your feedback!' : 'We will alert an expert to review this.');
      setMessages(prev => prev.map((m, i) => i === index ? { ...m, voted: type } : m));
    } catch (err) {
      console.error('Feedback Error:', err);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Bubble Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#1b4332',
          border: 'none',
          boxShadow: '0 8px 32px rgba(27, 67, 50, 0.4)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0)'
        }}
        id="krishi-mitra-trigger"
      >
        <span style={{ fontSize: '30px' }}>{isOpen ? '✕' : '🤖'}</span>
      </button>

      {/* Premium Chat Widget */}
      <div style={{
        position: 'fixed',
        bottom: '100px',
        right: '24px',
        width: '380px',
        height: '550px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '24px',
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        zIndex: 999,
        overflow: 'hidden',
        animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        `}</style>

        {/* Header */}
        <div style={{ 
          padding: '20px', 
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', 
          color: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <div style={{ 
            width: '44px', height: '44px', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '12px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px'
          }}>🤖</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>Krishi Mitra</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '11px', opacity: 0.9, fontWeight: '600' }}>Active Support</span>
            </div>
          </div>
          <button 
            onClick={() => {
              const newState = !autoSpeak;
              setAutoSpeak(newState);
              if(!newState) window.speechSynthesis.cancel();
              toast.success(newState ? 'Auto-Speak On 🔊' : 'Auto-Speak Off 🔇', { id: 'tts-toggle' });
            }}
            style={{ 
              background: autoSpeak ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', 
              border: 'none', borderRadius: '8px', padding: '6px 10px', color: '#fff', cursor: 'pointer', fontSize: '16px' 
            }}
            title="Toggle Auto-Speak"
          >
            {autoSpeak ? '🔊' : '🔇'}
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ 
          flex: 1, 
          padding: '24px 20px', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px'
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                padding: '14px 18px',
                borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                backgroundColor: m.role === 'user' ? '#1b4332' : '#fff',
                color: m.role === 'user' ? '#fff' : '#0f172a',
                boxShadow: m.role === 'user' ? '0 4px 12px rgba(27,67,50,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                fontSize: '14px',
                lineHeight: '1.6',
                fontWeight: '500',
                border: m.role === 'user' ? 'none' : '1px solid #f1f5f9',
                position: 'relative'
              }}>
                {m.text}
                
                {/* Feedback Buttons for AI */}
                {m.role === 'assistant' && i > 0 && (
                  <div style={{ 
                    display: 'flex', gap: '8px', marginTop: '10px', 
                    borderTop: '1px solid #f1f5f9', paddingTop: '8px'
                  }}>
                    <button 
                      onClick={() => handleVote(i, 'up')}
                      disabled={m.voted}
                      style={{ opacity: m.voted === 'up' ? 1 : 0.4, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >👍</button>
                    <button 
                      onClick={() => handleVote(i, 'down')}
                      disabled={m.voted}
                      style={{ opacity: m.voted === 'down' ? 1 : 0.4, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >👎</button>
                    <div style={{ flex: 1 }}></div>
                    <button 
                      onClick={() => speakText(m.text)}
                      style={{ fontSize: '12px', background: '#f1f5f9', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontWeight: 'bold', color: '#1b4332' }}
                    >📣 Listen</button>
                  </div>
                )}
              </div>
              <span style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', fontWeight: 'bold' }}>
                {formatTime(m.time)}
              </span>
            </div>
          ))}
          {isProcessing && (
            <div style={{ alignSelf: 'flex-start', padding: '14px 18px', borderRadius: '20px 20px 20px 4px', backgroundColor: '#fff', border: '1px solid #f1f5f9' }}>
               <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                 {isFirstAIRequest ? '⚡ Initializing AI Brain... (One-time download: 30MB)' : 'Thinking...'}
               </span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff', 
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ transform: 'scale(0.6)', margin: '-20px' }}>
              <BigMicButton 
                onRecordingComplete={handleVoiceRecording} 
                isProcessing={isProcessing}
                isAiReady={isAiReady}
              />
            </div>
            
            <form onSubmit={handleSendText} style={{ flex: 1, display: 'flex', gap: '8px', position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Krishi Mitra..."
                style={{
                  flex: 1,
                  padding: '14px 60px 14px 20px',
                  borderRadius: '16px',
                  border: '2px solid #f1f5f9',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'border-color 0.2s',
                  backgroundColor: '#f8fafc'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1b4332'}
                onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#1b4332',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (inputText.trim() && !isProcessing) ? 1 : 0.4
                }}
              >
                ➔
              </button>
            </form>
          </div>
          <p style={{ margin: 0, textAlign: 'center', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
            Krishi Mitra can speak in Hindi & English
          </p>
        </div>
      </div>

      {isOpen && !hasAcceptedDisclaimer && (
        <LegalDisclaimer onAccept={() => setHasAcceptedDisclaimer(true)} />
      )}
    </>
  );
}
