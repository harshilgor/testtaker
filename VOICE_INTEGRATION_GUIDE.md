# Voice Integration Guide

## Overview

This guide explains how to integrate professional Speech-to-Text (STT) and Text-to-Speech (TTS) services into your SAT learning application.

## Current Implementation

### 1. Speech-to-Text (STT)

#### **Primary: OpenAI Whisper**
- **API Endpoint**: `https://api.openai.com/v1/audio/transcriptions`
- **Model**: `whisper-1`
- **Format**: WebM audio with Opus codec
- **Features**: 
  - High accuracy transcription
  - Multilingual support
  - Noise reduction
  - Automatic language detection

#### **Fallback: Browser Speech Recognition**
- **API**: `webkitSpeechRecognition` / `SpeechRecognition`
- **Browser Support**: Chrome, Edge, Safari
- **Features**: Real-time transcription, no API costs

### 2. Text-to-Speech (TTS)

#### **Primary: OpenAI TTS**
- **API Endpoint**: `https://api.openai.com/v1/audio/speech`
- **Model**: `tts-1`
- **Voices Available**:
  - `alloy` - Neutral, balanced
  - `echo` - Warm, friendly
  - `fable` - Young, energetic
  - `onyx` - Deep, authoritative
  - `nova` - Clear, professional
  - `shimmer` - Soft, gentle

#### **Fallback: Browser Speech Synthesis**
- **API**: `SpeechSynthesisUtterance`
- **Features**: Built-in, no API costs, customizable rate/pitch

## Implementation Details

### STT Flow
1. **User clicks microphone button**
2. **Request microphone access** via `getUserMedia()`
3. **Start recording** with `MediaRecorder`
4. **Stop recording** after 10 seconds or manual stop
5. **Send audio to OpenAI Whisper** for transcription
6. **Fallback to browser STT** if Whisper fails
7. **Display transcribed text** in input field

### TTS Flow
1. **User clicks speaker button or auto-speak triggers**
2. **Send text to OpenAI TTS** API
3. **Receive audio blob** from API
4. **Play audio** using HTML5 Audio element
5. **Fallback to browser TTS** if OpenAI fails

## Code Structure

### Key Components

```typescript
// State management
const [isListening, setIsListening] = useState(false);
const [isProcessingSTT, setIsProcessingSTT] = useState(false);
const [isProcessingTTS, setIsProcessingTTS] = useState(false);

// Refs for audio handling
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const audioChunksRef = useRef<Blob[]>([]);
const speakingRef = useRef(false);
```

### STT Implementation

```typescript
const startListening = async () => {
  // 1. Get microphone access
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // 2. Create MediaRecorder
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  });
  
  // 3. Handle recording data
  mediaRecorder.ondataavailable = (event) => {
    audioChunksRef.current.push(event.data);
  };
  
  // 4. Process when recording stops
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    // Send to OpenAI Whisper
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      body: formData,
    });
    
    const data = await response.json();
    setInput(data.text);
  };
};
```

### TTS Implementation

```typescript
const speak = async (text: string) => {
  // 1. Send to OpenAI TTS
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'alloy',
      speed: 0.9,
    }),
  });

  // 2. Play audio
  if (response.ok) {
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  }
};
```

## Alternative Services

### Google Cloud Speech-to-Text
```typescript
// Alternative STT implementation
const googleSTT = async (audioBlob: Blob) => {
  const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GOOGLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
      },
      audio: {
        content: await blobToBase64(audioBlob),
      },
    }),
  });
};
```

### Amazon Polly TTS
```typescript
// Alternative TTS implementation
const amazonPolly = async (text: string) => {
  const response = await fetch('/api/polly-synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voiceId: 'Joanna', // Neural voice
      engine: 'neural',
    }),
  });
};
```

## Configuration Options

### Voice Settings
```typescript
// TTS Configuration
const ttsConfig = {
  voice: 'alloy',        // OpenAI voice
  speed: 0.9,           // Speech rate (0.25 - 4.0)
  pitch: 1.1,           // Pitch adjustment
  volume: 1.0,          // Volume level
};
```

### STT Configuration
```typescript
// STT Configuration
const sttConfig = {
  language: 'en-US',    // Language code
  model: 'whisper-1',   // OpenAI model
  maxDuration: 10000,   // Max recording time (ms)
  audioFormat: 'webm',  // Audio format
};
```

## Error Handling

### Graceful Degradation
1. **Primary service fails** → Try fallback
2. **Network error** → Use browser APIs
3. **Permission denied** → Show helpful message
4. **Unsupported browser** → Disable voice features

### User Feedback
- **Loading states** for processing
- **Visual indicators** for recording/speaking
- **Error messages** with suggestions
- **Status updates** in real-time

## Performance Considerations

### Optimization Tips
1. **Audio compression** before sending to API
2. **Caching** frequently used TTS responses
3. **Streaming** for long audio files
4. **Rate limiting** to prevent API abuse
5. **Offline fallback** for poor connectivity

### Cost Management
1. **API usage tracking** and limits
2. **Local caching** of common phrases
3. **User preferences** for voice quality vs. cost
4. **Batch processing** for multiple requests

## Security Considerations

### API Key Management
- **Environment variables** for API keys
- **Server-side proxy** for sensitive operations
- **Rate limiting** to prevent abuse
- **User authentication** for premium features

### Privacy
- **Local processing** when possible
- **Data retention** policies
- **User consent** for voice recording
- **GDPR compliance** for EU users

## Testing

### Voice Quality Testing
1. **Different accents** and speech patterns
2. **Background noise** scenarios
3. **Multiple languages** support
4. **Accessibility** compliance

### Performance Testing
1. **Latency** measurements
2. **Accuracy** comparisons
3. **Fallback** reliability
4. **Cross-browser** compatibility

## Future Enhancements

### Advanced Features
1. **Real-time translation** during conversations
2. **Voice cloning** for personalized experience
3. **Emotion detection** in speech
4. **Multi-speaker** recognition
5. **Offline voice** processing

### Integration Possibilities
1. **Video calls** with voice features
2. **Voice commands** for navigation
3. **Accessibility** tools for disabled users
4. **Language learning** applications
5. **Voice analytics** for user insights
