import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Mic, MicOff, Volume2, X, Info, Loader2, Settings, Brain, Target } from 'lucide-react';

interface SkillAnalysis {
  summary?: string;
  rootCauses?: string[];
  weaknesses?: string[];
  strengths?: string[];
  trends?: string[];
  benchmarks?: string[];
  recommendations?: string[];
  motivation?: string[];
  projections?: string[];
}

// Removed exposed API key. Keep empty to avoid leaking secrets; frontend should not call OpenAI directly.
const OPENAI_FALLBACK_KEY = '';

// Glowing Ball Voice Indicator Component
const GlowingBallIndicator: React.FC<{ 
  isActive: boolean; 
  isListening: boolean; 
  isProcessing: boolean;
  onClick: () => void;
}> = ({ isActive, isListening, isProcessing, onClick }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Background dot cloud effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 relative">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gray-400 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: isActive 
                  ? `pulse ${1 + Math.random() * 2}s infinite ease-in-out`
                  : 'none',
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main glowing ball */}
      <button
        onClick={onClick}
        disabled={isProcessing}
        className={`
          relative w-20 h-20 rounded-full transition-all duration-300 ease-in-out
          ${isActive 
            ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.5),0_0_60px_rgba(59,130,246,0.3),0_0_90px_rgba(59,130,246,0.1)]' 
            : 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-[0_0_20px_rgba(156,163,175,0.3)]'
          }
          ${isActive && isListening ? 'animate-pulse-scale' : ''}
          ${isProcessing ? 'animate-spin' : ''}
          hover:scale-105 active:scale-95
        `}
        aria-label={isActive ? "Voice assistant listening" : "Voice assistant muted"}
      >
        {/* Inner glow effect */}
        <div className={`
          absolute inset-2 rounded-full transition-all duration-300
          ${isActive 
            ? 'bg-gradient-to-br from-blue-300 to-blue-500 shadow-inner' 
            : 'bg-gradient-to-br from-gray-300 to-gray-500'
          }
        `} />
        
        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : isActive ? (
            <Mic className="w-8 h-8 text-white" />
          ) : (
            <MicOff className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Ripple effect when listening */}
        {isActive && isListening && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping opacity-75" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
          </>
        )}
      </button>
    </div>
  );
};

const Section: React.FC<{ title: string; items?: string[]; body?: string }> = ({ title, items, body }) => {
  if ((!items || items.length === 0) && !body) return null;
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      {body && <p className="text-sm text-gray-700">{body}</p>}
      {items && items.length > 0 && (
        <ul className="list-disc pl-5 space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-700">{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SkillLearnPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { subject, skill } = location.state || {};

  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  const [isProcessingTTS, setIsProcessingTTS] = useState(false);
  const speakingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy');
  const [showVoiceSelector, setShowVoiceSelector] = useState<boolean>(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState<boolean>(false);
  const [isInSession, setIsInSession] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [sessionQuestions, setSessionQuestions] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Available OpenAI TTS voices
  const availableVoices = [
    { id: 'alloy', name: 'Alloy', description: 'Balanced and clear' },
    { id: 'echo', name: 'Echo', description: 'Warm and friendly' },
    { id: 'fable', name: 'Fable', description: 'Storytelling and engaging' },
    { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
    { id: 'nova', name: 'Nova', description: 'Bright and energetic' },
    { id: 'shimmer', name: 'Shimmer', description: 'Smooth and calming' }
  ];

  // Helper function to detect silent or meaningless speech
  const isSilentOrMeaningless = (text: string): boolean => {
    const normalizedText = text.toLowerCase().trim();
    
    // Common silent/meaningless patterns
    const silentPatterns = [
      'silent', 'silence', 'quiet', 'nothing', 'um', 'uh', 'ah', 'er',
      'hmm', 'huh', 'what', 'sorry', 'pardon', 'repeat', 'again',
      'background noise', 'noise', 'static', 'unintelligible', 'inaudible'
    ];
    
    // Check if text is too short or matches silent patterns
    return normalizedText.length < 2 || 
           silentPatterns.some(pattern => normalizedText.includes(pattern)) ||
           /^[.,!?]*$/.test(normalizedText) || // Only punctuation
           /^[a-z]{1,2}$/.test(normalizedText); // Very short words
  };

  // Enhanced TTS with OpenAI
  const speak = async (text: string) => {
    try {
      setIsProcessingTTS(true);
      
      // Try OpenAI TTS first (better quality)
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_FALLBACK_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: selectedVoice,
          speed: 0.9,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        speakingRef.current = true;
        
        audio.onended = () => {
          speakingRef.current = false;
          currentAudioRef.current = null;
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.play();
      } else {
        // Fallback to browser TTS
        if ('speechSynthesis' in window) {
          const utter = new SpeechSynthesisUtterance(text);
          utter.rate = 0.9;
          utter.pitch = 1.1;
          speakingRef.current = true;
          utter.onend = () => { speakingRef.current = false; };
          window.speechSynthesis.speak(utter);
        }
      }
    } catch (error) {
      console.error('TTS error:', error);
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.9;
        utter.pitch = 1.1;
        speakingRef.current = true;
        utter.onend = () => { speakingRef.current = false; };
        window.speechSynthesis.speak(utter);
      }
    } finally {
      setIsProcessingTTS(false);
    }
  };

  // Enhanced STT with OpenAI Whisper
  const startListening = async () => {
    try {
      setIsListening(true);
      audioChunksRef.current = [];

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessingSTT(true);
        
        try {
          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Try OpenAI Whisper first
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');
          formData.append('model', 'whisper-1');
          formData.append('language', 'en');

          const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_FALLBACK_KEY}`,
            },
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            const userQuestion = data.text?.trim();
            
            // Validate user input - ignore empty, silent, or meaningless speech
            if (userQuestion && 
                userQuestion.length > 0 && 
                !isSilentOrMeaningless(userQuestion)) {
              
              // Add user message to chat
              setMessages(prev => [...prev, { role: 'user', content: userQuestion }]);
              
              // Get AI response
              await askTutor(userQuestion);
            } else {
              // User was silent or said nothing meaningful - just continue listening
              console.log('Silent or meaningless input detected, continuing to listen...');
            }
          } else {
            // Fallback to browser STT
            await startBrowserSTT();
          }
        } catch (error) {
          console.error('Whisper error:', error);
          // Fallback to browser STT
          await startBrowserSTT();
        } finally {
          setIsProcessingSTT(false);
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };

      // Start recording
      mediaRecorder.start();
      
      // Stop recording after 10 seconds or when user clicks stop
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 10000);

    } catch (error) {
      console.error('Microphone access error:', error);
      // Fallback to browser STT
      await startBrowserSTT();
    }
  };

  // Browser STT fallback
  const startBrowserSTT = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      setIsListening(false);
      setIsProcessingSTT(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript?.trim();
      setIsListening(false);
      setIsProcessingSTT(false);
      
      // Validate user input - ignore empty, silent, or meaningless speech
      if (transcript && 
          transcript.length > 0 && 
          !isSilentOrMeaningless(transcript)) {
        
        // Add user message to chat
        setMessages(prev => [...prev, { role: 'user', content: transcript }]);
        
        // Get AI response
        await askTutor(transcript);
      } else {
        // User was silent or said nothing meaningful - just continue listening
        console.log('Silent or meaningless input detected, continuing to listen...');
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsProcessingSTT(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setIsProcessingSTT(false);
    };

    recognitionRef.current.start();
  };

  // Clean up all voice-related resources
  const cleanupVoiceSession = () => {
    console.log('Cleaning up voice session...');
    
    // Stop any ongoing recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('Stopping media recorder...');
      mediaRecorderRef.current.stop();
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      console.log('Stopping speech recognition...');
      recognitionRef.current.stop();
    }
    
    // Stop any playing audio
    if (currentAudioRef.current) {
      console.log('Stopping current audio...');
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    
    // Stop browser speech synthesis
    if ('speechSynthesis' in window) {
      console.log('Cancelling speech synthesis...');
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
    }
    
    // Reset all states
    setIsListening(false);
    setIsProcessingSTT(false);
    setIsProcessingTTS(false);
    speakingRef.current = false;
    
    console.log('Voice session cleanup complete');
  };

  // Handle end session with confirmation
  const handleEndSession = () => {
    setShowEndConfirmation(true);
  };

  // Confirm end session
  const confirmEndSession = () => {
    console.log('User confirmed ending session');
    cleanupVoiceSession();
    setShowEndConfirmation(false);
    navigate(-1);
  };

  // Cancel end session
  const cancelEndSession = () => {
    setShowEndConfirmation(false);
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Build a natural, concise spoken summary from analysis and speak it
  const generateAndSpeakAnalysis = async (analysisData: SkillAnalysis) => {
    try {
      // Create personalized greeting
      const greeting = userName ? `Hi ${userName}! Today we will learn ${skill}. First, let's start by identifying your weaknesses. ` : `Hi there! Today we will learn ${skill}. First, let's start by identifying your weaknesses. `;
      
      let script = greeting;
      if (analysisData.summary) script += analysisData.summary + ' ';
      if ((analysisData.weaknesses || []).length > 0) {
        script += 'Key areas to focus on: ' + (analysisData.weaknesses || []).slice(0, 3).join('. ') + '. ';
      }
      if ((analysisData.recommendations || []).length > 0) {
        script += 'Try this: ' + (analysisData.recommendations || []).slice(0, 2).join('. ') + '. ';
      }
      if ((analysisData.motivation || []).length > 0) script += (analysisData.motivation || [])[0];

      if (script.trim().length === 0) {
        script = greeting + `Let's get started with ${skill}. I will guide you to improve step by step.`;
      }

      setMessages([{ role: 'assistant', content: script }]);
      await speak(script);
    } catch (e) {
      // Safe fallback
      const fallback = userName ? `Hi ${userName}! Welcome back! Let's work on ${skill}. What would you like help with first?` : `Welcome back! Let's work on ${skill}. What would you like help with first?`;
      setMessages([{ role: 'assistant', content: fallback }]);
      await speak(fallback);
    }
  };

  // Parse localStorage quizResults into attempt-like rows for a given skill
  const collectLocalAttempts = (targetSkill: string, subjectKey: 'math' | 'english') => {
    try {
      const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const subjectLabel = subjectKey === 'math' ? 'Math' : 'English';
      const attempts = (stored || [])
        .filter((entry: any) => entry && entry.subject === subjectLabel && Array.isArray(entry.questions))
        .flatMap((entry: any) => {
          const answers: number[] = Array.isArray(entry.answers) ? entry.answers : [];
          return (entry.questions || [])
            .map((q: any, idx: number) => ({
              topic: q?.topic,
              difficulty: q?.difficulty || 'medium',
              time_spent: Math.max(0, Number(q?.timeSpent) || 0),
              is_correct: answers[idx] === q?.correctAnswer,
              created_at: entry.completed_at || new Date().toISOString()
            }))
            .filter((a: any) => {
              const topic = (a.topic || '').toString().toLowerCase();
              const target = targetSkill.toLowerCase();
              // More flexible matching - check if topic contains target or vice versa
              return topic.includes(target) || target.includes(topic) || 
                     topic.replace(/\s+/g, '') === target.replace(/\s+/g, '') ||
                     topic.replace(/[^a-z]/g, '') === target.replace(/[^a-z]/g, '');
            });
        });
      return attempts;
    } catch {
      return [] as any[];
    }
  };

  // Helper function to create skill variations for better matching
  const getSkillVariations = (skill: string) => {
    const variations = [skill];
    
    // Common skill name variations
    const skillMap: { [key: string]: string[] } = {
      'words in context': ['vocabulary in context', 'context clues', 'word meaning', 'vocabulary'],
      'central ideas and details': ['main idea', 'central idea', 'supporting details', 'key details'],
      'command of evidence': ['evidence', 'textual evidence', 'supporting evidence'],
      'expression of ideas': ['writing expression', 'ideas expression', 'writing style'],
      'standard english conventions': ['grammar', 'conventions', 'punctuation', 'sentence structure'],
      'algebra': ['algebraic expressions', 'equations', 'linear equations'],
      'geometry': ['geometric shapes', 'angles', 'triangles', 'circles'],
      'data analysis': ['statistics', 'data interpretation', 'graphs', 'charts']
    };
    
    const normalizedSkill = skill.toLowerCase();
    if (skillMap[normalizedSkill]) {
      variations.push(...skillMap[normalizedSkill]);
    }
    
    return variations;
  };

  useEffect(() => {
    const run = async () => {
      if (!subject || !skill) { 
        setError('Missing skill context'); 
        setLoading(false); 
        return; 
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { 
          setError('Please sign in'); 
          setLoading(false); 
          return; 
        }

        // Get user's name from auth metadata
        const userDisplayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
        setUserName(userDisplayName);

        // Get user's dream score for context
        const { data: goalData } = await supabase
          .from('user_goals')
          .select('target')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        const dreamScore = goalData?.target || 1500;

        // Get skill variations for better matching
        const skillVariations = getSkillVariations(skill);
        const subjectKey: 'math' | 'english' = subject === 'math' ? 'math' : 'english';

        // Pull attempts from DB for this skill with flexible matching
        const { data: dbAttempts } = await supabase
          .from('question_attempts_v2')
          .select('is_correct,time_spent,difficulty,created_at,question_id,topic')
          .eq('user_id', user.id)
          .eq('subject', subjectKey)
          .order('created_at', { ascending: false })
          .limit(500); // Increased limit to get more data

        // Filter attempts that match any skill variation
        const filteredDbAttempts = (dbAttempts || []).filter((attempt: any) => {
          const topic = (attempt.topic || '').toString().toLowerCase();
          return skillVariations.some(variation => {
            const normalizedVariation = variation.toLowerCase();
            return topic.includes(normalizedVariation) || 
                   normalizedVariation.includes(topic) ||
                   topic.replace(/\s+/g, '') === normalizedVariation.replace(/\s+/g, '') ||
                   topic.replace(/[^a-z]/g, '') === normalizedVariation.replace(/[^a-z]/g, '');
          });
        });

        // Collect local attempts for this skill
        const localAttempts = collectLocalAttempts(skill, subjectKey);

        const combinedAttempts = [
          ...filteredDbAttempts,
          ...localAttempts
        ];

        console.log(`Found ${filteredDbAttempts.length} DB attempts and ${localAttempts.length} local attempts for skill: ${skill}`);
        console.log('Skill variations searched:', skillVariations);
        console.log('Sample DB topics found:', [...new Set(filteredDbAttempts.map((a: any) => a.topic))]);

        const totalAttempts = combinedAttempts.length;
        const correctAttempts = combinedAttempts.filter(a => !!(a as any).is_correct).length;
        const recentAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

        // If we have attempts, provide detailed analysis
        if (totalAttempts > 0) {
          const payload = {
            subject,
            skill,
            summary: {
              dreamScore,
              totalAttempts,
              recentAccuracy
            },
            attempts: combinedAttempts
          };

          console.log('Sending skill analysis payload:', payload);

          const { data, error: functionError } = await supabase.functions.invoke('openai-insight-generator', {
            body: { 
              skillAnalysisData: payload, 
              tzOffsetMinutes: new Date().getTimezoneOffset() 
            }
          });

          console.log('Raw function response:', data);
          console.log('Function error:', functionError);

          if (functionError) { 
            console.error('Function error:', functionError);
            // Try fallback analysis with direct OpenAI call
            await generateFallbackAnalysis(payload);
            return;
          }

          if (data?.analysis) {
            setAnalysis(data.analysis);
            await generateAndSpeakAnalysis(data.analysis);
          } else {
            // Try fallback analysis using OpenAI directly
            await generateFallbackAnalysis(payload);
          }
        } else {
          // No attempts found - provide starter guidance
          const starter = {
            summary: `Welcome to ${skill}. Let's build a solid foundation and improve quickly.`,
            weaknesses: ['Not enough attempts recorded yet to diagnose specific gaps'],
            recommendations: [
              'Start with 5–10 focused questions for this skill',
              'Review every explanation and note mistake patterns'
            ],
            motivation: ['Every session moves you closer to your goal—let\'s begin!']
          } as SkillAnalysis;
          setAnalysis(starter);
          await generateAndSpeakAnalysis(starter);
        }
      } catch (e) {
        console.error('Analysis error:', e);
        // Provide non-blocking message instead of red error
        const starter = {
          summary: `Let's get started with ${skill}. We'll analyze your progress as you practice.`,
          recommendations: ['Do a quick 5-question drill now to generate deeper insights'],
          motivation: ['You\'ve got this—small consistent steps are powerful']
        } as SkillAnalysis;
        setAnalysis(starter);
        await generateAndSpeakAnalysis(starter);
      } finally {
        setLoading(false);
      }
    };

    const generateFallbackAnalysis = async (payload: any) => {
      try {
        const prompt = `You are an expert SAT coach analyzing a student's performance for the skill "${payload.skill}" in ${payload.subject}. 

Student Data:
- Dream Score: ${payload.summary.dreamScore}
- Total Attempts: ${payload.summary.totalAttempts}
- Recent Accuracy: ${payload.summary.recentAccuracy.toFixed(1)}%
- Recent Attempts: ${JSON.stringify(payload.attempts.slice(0, 10))}

Provide a comprehensive analysis in this exact JSON format:
{
  "summary": "A 2-3 sentence overview of the student's current performance",
  "rootCauses": ["3-4 specific reasons why they might be struggling"],
  "weaknesses": ["3-4 specific areas that need improvement"],
  "strengths": ["2-3 positive aspects of their performance"],
  "trends": ["2-3 observations about their progress patterns"],
  "benchmarks": ["2-3 comparisons to typical SAT performance"],
  "recommendations": ["4-5 specific, actionable steps to improve"],
  "motivation": ["2-3 encouraging statements about their potential"],
  "projections": ["2-3 predictions about their improvement trajectory"]
}

Keep each item concise and actionable.`;

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_FALLBACK_KEY}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an SAT prep expert. Return only valid JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content || '{}';
        
        try {
          const parsed = JSON.parse(content);
          setAnalysis(parsed);
          if (parsed.summary) {
            speak(parsed.summary);
          }
        } catch (parseError) {
          console.error('Failed to parse fallback analysis:', parseError);
          setError('Could not generate analysis');
        }
      } catch (fallbackError) {
        console.error('Fallback analysis failed:', fallbackError);
        setError('Analysis service unavailable');
      }
    };

    run();
  }, [subject, skill]);

  // Auto-start listening after initial load so user is unmuted by default
  useEffect(() => {
    if (!loading && !isListening && !isProcessingSTT && !isProcessingTTS) {
      const t = setTimeout(() => {
        if (!isListening) {
          startListening();
        }
      }, 1200); // delay slightly to avoid capturing initial TTS
      return () => clearTimeout(t);
    }
  }, [loading, isListening, isProcessingSTT, isProcessingTTS]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupVoiceSession();
    };
  }, []);

  // Close voice selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showVoiceSelector && !target.closest('.voice-selector')) {
        setShowVoiceSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVoiceSelector]);

  const askTutor = async (question: string) => {
    try {
      const prompt = `You are a warm, encouraging SAT tutor helping a student named ${userName || 'there'} with the skill "${skill}" for ${subject}. 

Your personality:
- Be friendly and supportive, like a caring teacher
- Use conversational language, not formal academic tone
- Show enthusiasm for their learning journey
- Give specific, actionable advice
- Keep responses under 100 words
- If they ask for practice, give one question and wait for their answer
- Use their name when appropriate to make it personal
- If they're in a practice session, guide them through the current question step by step

Current conversation context: ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
${currentQuestion ? `\nCurrent practice question: ${JSON.stringify(currentQuestion)}` : ''}
${userAnswer ? `\nStudent's answer: ${userAnswer}` : ''}

Student's question: ${question}

Respond in a warm, encouraging tone:`;
      
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_FALLBACK_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: question }
          ],
          temperature: 0.8,
          max_tokens: 300
        })
      });
      
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || 'I\'m here to help! What would you like to work on?';
      setMessages(prev => [...prev, { role: 'assistant', content }]);
      speak(content);
    } catch {
      const fallback = 'I\'m here to support you every step of the way! What would you like to focus on?';
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      speak(fallback);
    }
  };

  // Generate challenging questions based on user's weaknesses
  const generateChallengingQuestions = async () => {
    try {
      // Get questions from the database for this skill
      const testFilter = subject === 'math' ? 'Math' : 'Reading and Writing';
      
      const { data: questions, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('test', testFilter)
        .eq('skill', skill)
        .order('difficulty', { ascending: false }) // Start with harder questions
        .limit(10);

      if (error || !questions || questions.length === 0) {
        console.error('Error fetching questions:', error);
        return;
      }

      // Filter to get challenging questions (medium to hard difficulty)
      const challengingQuestions = questions.filter(q => 
        q.difficulty === 'hard' || q.difficulty === 'medium'
      ).slice(0, 5);

      setSessionQuestions(challengingQuestions);
      setCurrentQuestion(challengingQuestions[0]);
      setQuestionIndex(0);
      setIsInSession(true);
      setShowAnswer(false);
      setUserAnswer('');

      // Start the session with AI guidance
      const sessionStartMessage = `Great! I've prepared ${challengingQuestions.length} challenging questions for you based on your performance analysis. Let's work through them together. Here's your first question: ${challengingQuestions[0].question_text}. Take your time to think about it, and I'll guide you through the solution.`;
      
      setMessages(prev => [...prev, { role: 'assistant', content: sessionStartMessage }]);
      await speak(sessionStartMessage);

    } catch (error) {
      console.error('Error generating questions:', error);
      const errorMessage = 'Sorry, I couldn\'t generate questions right now. Let\'s try again in a moment.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
      await speak(errorMessage);
    }
  };

  // Handle user's answer submission
  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) return;

    setShowAnswer(true);
    
    // Add user's answer to chat
    setMessages(prev => [...prev, { role: 'user', content: `My answer: ${userAnswer}` }]);
    
    // Get AI feedback on the answer
    const feedbackPrompt = `The student answered: "${userAnswer}" for the question: "${currentQuestion.question_text}". The correct answer is: "${currentQuestion.correct_answer}". Please provide encouraging feedback and explain the solution step by step.`;
    
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_FALLBACK_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a supportive SAT tutor. Provide encouraging feedback and clear explanations.' },
            { role: 'user', content: feedbackPrompt }
          ],
          temperature: 0.8,
          max_tokens: 400
        })
      });
      
      const data = await res.json();
      const feedback = data?.choices?.[0]?.message?.content || 'Great effort! Let me explain the solution.';
      
      setMessages(prev => [...prev, { role: 'assistant', content: feedback }]);
      await speak(feedback);
      
    } catch (error) {
      const fallbackFeedback = 'Great effort! Let me explain the solution step by step.';
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackFeedback }]);
      await speak(fallbackFeedback);
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (questionIndex < sessionQuestions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setCurrentQuestion(sessionQuestions[nextIndex]);
      setShowAnswer(false);
      setUserAnswer('');
      
      const nextQuestionMessage = `Great! Let's move to question ${nextIndex + 1} of ${sessionQuestions.length}: ${sessionQuestions[nextIndex].question_text}`;
      setMessages(prev => [...prev, { role: 'assistant', content: nextQuestionMessage }]);
      speak(nextQuestionMessage);
    } else {
      // Session completed
      const completionMessage = `Excellent work! You've completed all ${sessionQuestions.length} questions. You've made great progress with ${skill}. Would you like to practice more or review what we covered?`;
      setMessages(prev => [...prev, { role: 'assistant', content: completionMessage }]);
      speak(completionMessage);
      setIsInSession(false);
      setCurrentQuestion(null);
      setSessionQuestions([]);
      setQuestionIndex(0);
    }
  };

  // End practice session
  const endSession = () => {
    setIsInSession(false);
    setCurrentQuestion(null);
    setSessionQuestions([]);
    setQuestionIndex(0);
    setShowAnswer(false);
    setUserAnswer('');
    
    const endMessage = 'Practice session ended. Great work! You can start a new session anytime.';
    setMessages(prev => [...prev, { role: 'assistant', content: endMessage }]);
    speak(endMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Learn — {skill}</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEndSession}
          >
            End
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Deep analysis */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Where to Improve</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <div className="text-sm text-gray-600">Generating a detailed analysis...</div>
                </div>
              ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : analysis ? (
                <div className="space-y-6">
                  <Section title="Summary" body={analysis.summary} />
                  <Section title="Root Causes" items={analysis.rootCauses} />
                  <Section title="Weaknesses" items={analysis.weaknesses} />
                  <Section title="Strengths" items={analysis.strengths} />
                  <Section title="Trends" items={analysis.trends} />
                  <Section title="Benchmarks" items={analysis.benchmarks} />
                  <Section title="Recommendations" items={analysis.recommendations} />
                  <Section title="Motivation & Projections" items={[...(analysis.motivation || []), ...(analysis.projections || [])]} />
                </div>
              ) : (
                <div className="text-sm text-gray-600">No analysis available</div>
              )}
            </CardContent>
          </Card>

          {/* Right: Futuristic AI Tutor Interface */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-8 h-[700px] flex flex-col relative overflow-hidden">
              {/* Background dot cloud effect */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(100)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-gray-400 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: isListening || speakingRef.current 
                        ? `pulse ${1 + Math.random() * 2}s infinite ease-in-out`
                        : 'none',
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">AI Tutor</h3>
                    <p className="text-gray-400 text-sm">Voice Assistant</p>
                  </div>
                </div>
                
                {/* Voice Selection */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                    className="text-gray-300 hover:text-white p-2"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  {showVoiceSelector && (
                    <div className="absolute right-0 top-10 bg-gray-800 border border-gray-600 rounded-lg p-3 w-48 z-20">
                      <div className="text-xs text-gray-300 mb-2">Choose AI Voice:</div>
                      <div className="space-y-1">
                        {availableVoices.map((voice) => (
                          <button
                            key={voice.id}
                            onClick={() => {
                              setSelectedVoice(voice.id);
                              setShowVoiceSelector(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                              selectedVoice === voice.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <div className="font-medium">{voice.name}</div>
                            <div className="text-gray-400">{voice.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-auto mb-8 space-y-3 relative z-10">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-100'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Voice Interface */}
              <div className="relative z-10 space-y-6">
                {/* Status Text */}
                <div className="text-center">
                  <p className="text-cyan-400 text-lg font-medium mb-2">
                    {isListening ? 'Listening...' : 
                     isProcessingSTT ? 'Processing...' : 
                     isProcessingTTS ? 'Speaking...' : 
                     'Say something.'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {isListening ? 'Speak now!' : 
                     isProcessingSTT ? 'Converting your speech...' : 
                     isProcessingTTS ? 'Generating response...' : 
                     'Tap the ball to start'}
                  </p>
                </div>

                {/* Glowing Ball Indicator */}
                <div className="flex justify-center">
                  <GlowingBallIndicator
                    isActive={!isListening && !isProcessingSTT && !isProcessingTTS}
                    isListening={isListening}
                    isProcessing={isProcessingSTT || isProcessingTTS}
                    onClick={isListening ? stopListening : startListening}
                  />
                </div>

                                 {/* Control Buttons */}
                 <div className="flex justify-center gap-4">
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => setShowEndConfirmation(true)}
                     className="text-gray-400 hover:text-white p-2"
                   >
                     <X className="h-5 w-5" />
                   </Button>
                 </div>

                 {/* Start Session Button */}
                 {!isInSession && (
                   <div className="mt-6">
                     <Button
                       onClick={generateChallengingQuestions}
                       className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                     >
                       <Target className="h-5 w-5 mr-2" />
                       Start Practice Session
                     </Button>
                     <p className="text-gray-400 text-xs text-center mt-2">
                       Practice challenging questions based on your weaknesses
                     </p>
                   </div>
                 )}

                 {/* Practice Session Interface */}
                 {isInSession && currentQuestion && (
                   <div className="mt-6 space-y-4">
                     {/* Question Progress */}
                     <div className="text-center">
                       <div className="text-cyan-400 text-sm font-medium">
                         Question {questionIndex + 1} of {sessionQuestions.length}
                       </div>
                       <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                         <div 
                           className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                           style={{ width: `${((questionIndex + 1) / sessionQuestions.length) * 100}%` }}
                         />
                       </div>
                     </div>

                     {/* Current Question */}
                     <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                       <h4 className="text-white font-medium mb-3">Current Question:</h4>
                       <p className="text-gray-300 text-sm leading-relaxed">
                         {currentQuestion.question_text}
                       </p>
                       {currentQuestion.options && (
                         <div className="mt-3 space-y-2">
                           {currentQuestion.options.map((option: string, idx: number) => (
                             <div key={idx} className="text-gray-400 text-sm">
                               {String.fromCharCode(65 + idx)}. {option}
                             </div>
                           ))}
                         </div>
                       )}
                     </div>

                     {/* Answer Input */}
                     {!showAnswer && (
                       <div className="space-y-3">
                         <input
                           type="text"
                           value={userAnswer}
                           onChange={(e) => setUserAnswer(e.target.value)}
                           placeholder="Type your answer here..."
                           className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                           onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                         />
                         <Button
                           onClick={handleAnswerSubmit}
                           disabled={!userAnswer.trim()}
                           className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           Submit Answer
                         </Button>
                       </div>
                     )}

                     {/* Answer Feedback */}
                     {showAnswer && (
                       <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                         <h4 className="text-white font-medium mb-2">Solution:</h4>
                         <p className="text-gray-300 text-sm">
                           <strong>Correct Answer:</strong> {currentQuestion.correct_answer}
                         </p>
                         <p className="text-gray-300 text-sm mt-2">
                           <strong>Your Answer:</strong> {userAnswer}
                         </p>
                       </div>
                     )}

                     {/* Navigation Buttons */}
                     <div className="flex gap-3">
                       <Button
                         onClick={endSession}
                         variant="outline"
                         className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                       >
                         End Session
                       </Button>
                       {showAnswer && (
                         <Button
                           onClick={nextQuestion}
                           className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                         >
                           {questionIndex < sessionQuestions.length - 1 ? 'Next Question' : 'Finish Session'}
                         </Button>
                       )}
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End Session Confirmation Dialog */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              End Learning Session?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end this learning session? All voice interactions will be stopped.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelEndSession}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmEndSession}
                className="px-4 py-2"
              >
                End Session
              </Button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse-scale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
          
          .animate-pulse-scale {
            animation: pulse-scale 1.2s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes glow {
            0%, 100% { 
              box-shadow: 0 0 30px rgba(59,130,246,0.5), 0 0 60px rgba(59,130,246,0.3), 0 0 90px rgba(59,130,246,0.1);
            }
            50% { 
              box-shadow: 0 0 40px rgba(59,130,246,0.7), 0 0 80px rgba(59,130,246,0.5), 0 0 120px rgba(59,130,246,0.2);
            }
          }

          .animate-glow {
            animation: glow 2s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );
};

export default SkillLearnPage;


