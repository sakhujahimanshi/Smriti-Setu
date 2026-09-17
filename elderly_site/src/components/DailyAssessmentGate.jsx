import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mic, MicOff, Volume2, Sparkles, ArrowRight, CheckCircle2, Heart, HelpCircle } from 'lucide-react';
import { speechService } from '../services/speechService';
import { emitTelemetry } from '../socket';

const DEFAULT_QUESTIONS = [
  {
    questionId: 'q_user_name',
    category: 'identity',
    questionText: {
      en: 'What is your full name?',
      as: 'আপোনাৰ সম্পূৰ্ণ নাম কি?',
      bn: 'আপনার পুরো নাম কি?',
      ne: 'तपाईंको पूरा नाम के हो?'
    },
    expectedAnswers: ['Bhaben Baruah', 'Bhaben', 'Koka', 'Bhaben Barua', 'ভবেন বৰুৱা', 'ভবেন'],
    importance: 'high',
    orderIndex: 1
  },
  {
    questionId: 'q_spouse_name',
    category: 'family',
    questionText: {
      en: "What is your spouse's (wife's) name?",
      as: 'আপোনাৰ সহধৰ্মিণীৰ (পত্নীৰ) নাম কি?',
      bn: 'আপনার সহধর্মিণীর (স্ত্রীর) নাম কি?',
      ne: 'तपाईंको श्रीमतीको नाम के हो?'
    },
    expectedAnswers: ['Pratima', 'Pratima Baruah', 'Aita Pratima', 'প্ৰতিমা', 'প্ৰতিমা বৰুৱা', 'प्रतिमा'],
    importance: 'high',
    orderIndex: 2
  },
  {
    questionId: 'q_child_name',
    category: 'family',
    questionText: {
      en: "What is your granddaughter's or daughter's name?",
      as: 'আপোনাৰ নাতিনী বা জীয়াৰীৰ নাম কি?',
      bn: 'আপনার নাতনি বা মেয়ের নাম কি?',
      ne: 'तपाईंकी नातिनी वा छोरीको नाम के हो?'
    },
    expectedAnswers: ['Ananya', 'Dr. Ananya Sarma', 'Ananya Sarma', 'অনন্যা', 'অনন্যা শৰ্মা', 'अनन्या'],
    importance: 'high',
    orderIndex: 3
  },
  {
    questionId: 'q_location',
    category: 'location',
    questionText: {
      en: 'Where do you currently live?',
      as: 'আপুনি বৰ্তমান ক’ত থাকে?',
      bn: 'আপনি বর্তমানে কোথায় থাকেন?',
      ne: 'तपाईं हाल कहाँ बस्नुहुन्छ?'
    },
    expectedAnswers: ['Beltola', 'Guwahati', 'Beltola Guwahati', 'বেলেতলা', 'গুৱাহাটী', 'বেলতলা', 'गुवाहाटी'],
    importance: 'high',
    orderIndex: 4
  },
  {
    questionId: 'q_guardian_phone',
    category: 'emergency',
    questionText: {
      en: "What is your family caregiver or guardian's phone number?",
      as: 'আপোনাৰ তত্ত্বাৱধায়ক বা পৰিয়ালৰ ফোন নম্বৰ কি?',
      bn: 'আপনার অভিভাবক বা পরিবারের ফোন নম্বর কি?',
      ne: 'तपाईंको हेरचाहकर्ता वा अभिभावकको फोन नम्बर के हो?'
    },
    expectedAnswers: ['9876543210', '98765 43210', '+91 98765 43210', '+919876543210', '98765-43210'],
    importance: 'high',
    orderIndex: 5
  },
  {
    questionId: 'q_hometown',
    category: 'culture',
    questionText: {
      en: 'In which town or district of Assam did you grow up?',
      as: 'আপুনি অসমৰ কোনখন চহৰ বা জিলাত ডাঙৰ-দীঘল হৈছিল?',
      bn: 'আপনি আসামের কোন শহরে বা জেলায় বড় হয়েছেন?',
      ne: 'तपाईं असमको कुन सहर वा जिल्लामा हुर्कनुभएको हो?'
    },
    expectedAnswers: ['Jorhat', 'Sivasagar', 'যোৰহাট', 'শিৱসাগৰ', 'জোড়হাট', 'जोरहाट'],
    importance: 'standard',
    orderIndex: 6
  }
];

export default function DailyAssessmentGate({ onComplete, selectedLanguage = 'as', onLanguageChange, apiUrl = '' }) {
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [answersLog, setAnswersLog] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Internal language state — initialized from prop, can be changed within the gate
  const [activeLang, setActiveLang] = useState(selectedLanguage);

  const LANG_OPTIONS = [
    { code: 'as', flag: '🏔️', label: 'অসমীয়া', short: 'AS' },
    { code: 'bn', flag: '🌿', label: 'বাংলা', short: 'BN' },
    { code: 'ne', flag: '⛰️', label: 'नेपाली', short: 'NE' },
    { code: 'en', flag: '🌐', label: 'English', short: 'EN' }
  ];

  const handleLangSwitch = (code) => {
    setActiveLang(code);
    speechService.stop();
    if (typeof onLanguageChange === 'function') onLanguageChange(code);
  };

  const recognitionRef = useRef(null);

  // 1. Fetch curated daily questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/assessment/questions`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setQuestions(data);
          }
        }
      } catch (err) {
        console.warn('Using seeded assessment questions:', err);
      }
    };
    fetchQuestions();
  }, [apiUrl]);

  const currentQ = questions[currentIndex] || DEFAULT_QUESTIONS[0];
  const currentQText = currentQ
    ? (typeof currentQ.questionText === 'object'
        ? (currentQ.questionText[activeLang] || currentQ.questionText.en || '')
        : String(currentQ.questionText))
    : '';

  // 2. Speak question when index changes
  useEffect(() => {
    if (currentQText && !validationResult) {
      speechService.stop();
      speechService.speak(currentQText, activeLang);
    }
  }, [currentIndex, currentQText, activeLang]);

  // 3. Web Speech Recognition setup for voice input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const langMap = {
        as: 'as-IN',
        bn: 'bn-IN',
        ne: 'ne-NP',
        en: 'en-IN'
      };
      recognition.lang = langMap[activeLang] || 'en-IN';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [activeLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in this browser. Please type your answer in the box.');
      return;
    }

    if (isListening) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    } else {
      try {
        speechService.stop();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Voice start error:', err);
      }
    }
  };

  // 4. Validate answer against caregiver key
  const handleValidate = async () => {
    if (!userAnswer.trim() || !currentQ || isValidating) return;

    setIsValidating(true);
    speechService.stop();

    try {
      const res = await fetch(`${apiUrl}/api/assessment/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.questionId,
          userAnswer: userAnswer.trim(),
          lang: activeLang
        })
      });

      if (res.ok) {
        const result = await res.json();
        setValidationResult(result);

        // Stream telemetry to Caregiver Dashboard
        emitTelemetry({
          activityTitle: 'Daily Memory Assessment Gate',
          activityType: 'assessment',
          status: result.isCorrect ? 'Correct response' : 'Polite correction provided',
          isCorrect: result.isCorrect,
          userVoiceTranscript: userAnswer.trim()
        });

        // Speak empathetic confirmation or polite correction
        speechService.speak(result.politeMessage, activeLang);

        // Record in log
        setAnswersLog(prev => [
          ...prev,
          {
            questionId: currentQ.questionId,
            questionText: currentQText,
            userAnswer: userAnswer.trim(),
            isCorrect: result.isCorrect,
            correctProvided: result.expectedAnswer,
            method: isListening ? 'voice' : 'text'
          }
        ]);
      } else {
        throw new Error('Server returned non-ok');
      }
    } catch (err) {
      console.warn('Validation API notice, falling back to local key:', err);
      // Offline / Local fuzzy matching against expected answers
      const normInput = userAnswer.trim().toLowerCase().replace(/[+.,!?'"()\-–—_]/g, '').replace(/\s+/g, '');
      const expectedList = currentQ.expectedAnswers || [];
      const primaryExpected = expectedList[0] || 'Bhaben Baruah';
      const isCorrect = expectedList.some(exp => {
        const normExp = exp.toLowerCase().replace(/[+.,!?'"()\-–—_]/g, '').replace(/\s+/g, '');
        return normInput.includes(normExp) || normExp.includes(normInput);
      });

      const politeMessage = isCorrect 
        ? (activeLang === 'as' ? "বৰ ধুনীয়া! একেবাৰে সঠিক উত্তৰ।" : "Wonderful! That's completely correct.")
        : (activeLang === 'as' 
            ? `একো কথা নাই, ইয়াৰ সঠিক উত্তৰটো হ'ল: ${primaryExpected}। আহক আমি শান্তভাৱে আগবাঢ়োঁ।` 
            : `That's completely fine! The correct answer is: ${primaryExpected}. Let's continue together.`);

      const fallbackResult = {
        isCorrect,
        expectedAnswer: primaryExpected,
        politeMessage
      };

      setValidationResult(fallbackResult);
      speechService.speak(politeMessage, activeLang);
      setAnswersLog(prev => [
        ...prev,
        {
          questionId: currentQ.questionId,
          questionText: currentQText,
          userAnswer: userAnswer.trim(),
          isCorrect,
          correctProvided: primaryExpected,
          method: isListening ? 'voice' : 'text'
        }
      ]);
    } finally {
      setIsValidating(false);
    }
  };

  // 5. Advance to next question or complete
  const handleNext = async () => {
    speechService.stop();
    setValidationResult(null);
    setUserAnswer('');

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed all questions -> submit to backend for AI Trend Tracking
      setIsFinished(true);

      const score = answersLog.filter(a => a.isCorrect).length;
      try {
        await fetch(`${apiUrl}/api/assessment/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: answersLog,
            totalQuestions: questions.length,
            score
          })
        });
      } catch (err) {
        console.warn('Submit error:', err);
      }
    }
  };

  const handleRepeatQuestion = () => {
    speechService.stop();
    speechService.speak(currentQText, activeLang);
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#FAF8F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌸</div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '28px' }}>
            প্ৰস্তুত কৰা হৈছে... Preparing your peaceful daily check-in...
          </h2>
        </div>
      </div>
    );
  }

  // Finished Screen
  if (isFinished) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF8F5 0%, #F0FDF4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div className="focus-card" style={{ maxWidth: '700px', textAlign: 'center', padding: '3.5rem 2.5rem' }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'var(--affirm-green-light)',
            color: 'var(--affirm-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.15)'
          }}>
            <Sparkles size={46} />
          </div>

          <h2 style={{ fontSize: '34px', marginBottom: '12px' }}>
            দৈনিক পৰীক্ষা সম্পন্ন হ’ল! (Daily Check-in Complete)
          </h2>
          <p style={{ fontSize: '21px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
            আপোনাৰ সুন্দৰ অংশগ্ৰহণৰ বাবে ধন্যবাদ। আপোনাৰ দিনটো শান্ত আৰু আনন্দময় হওক!
            <br />
            <span style={{ fontSize: '18px' }}>Thank you for taking a moment with us today. Your platform is now ready.</span>
          </p>

          <button
            type="button"
            className="btn-large btn-sage"
            onClick={onComplete}
            style={{ width: '100%', minHeight: '68px', fontSize: '22px', borderRadius: '18px' }}
          >
            <span>প্ৰধান মেনুলৈ যাওক (Enter Dashboard)</span>
            <ArrowRight size={26} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'linear-gradient(135deg, #FAF8F5 0%, #EFF6FF 100%)',
      overflowY: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem'
    }}>
      <div className="focus-card" style={{ maxWidth: '850px', width: '100%', padding: '2.5rem' }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            borderBottom: '2px solid var(--border-subtle)',
            paddingBottom: '1rem',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '22px', margin: 0, color: 'var(--text-main)' }}>
                স্মৃতি সেতু — দৈনিক মনত পেলোৱা পৰীক্ষা
              </h3>
              <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
                Daily Memory Verification Gate • Dignity-First
              </span>
            </div>
          </div>

          {/* Language Selector */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {LANG_OPTIONS.map(opt => (
              <button
                key={opt.code}
                type="button"
                onClick={() => handleLangSwitch(opt.code)}
                title={opt.label}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: `2px solid ${activeLang === opt.code ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                  background: activeLang === opt.code ? 'var(--accent-amber-light)' : '#FFFFFF',
                  color: activeLang === opt.code ? 'var(--accent-amber-hover)' : 'var(--text-muted)',
                  fontWeight: activeLang === opt.code ? '800' : '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span>{opt.flag}</span>
                <span>{opt.short}</span>
              </button>
            ))}
          </div>

          <div style={{
            background: '#F1F5F9',
            padding: '6px 16px',
            borderRadius: '14px',
            fontSize: '17px',
            fontWeight: '700',
            color: '#334155'
          }}>
            প্ৰশ্ন {currentIndex + 1} / {questions.length} (Question {currentIndex + 1} of {questions.length})
          </div>
        </div>

        {/* Question Spotlight */}
        <div style={{
          background: '#FFFFFF',
          border: '2px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <h2 style={{ fontSize: '32px', color: 'var(--text-main)', margin: 0, lineHeight: '1.4' }}>
              {currentQText}
            </h2>
            <button
              type="button"
              className="speaker-btn"
              onClick={handleRepeatQuestion}
              title="Listen again aloud"
              style={{ flexShrink: 0, padding: '12px 18px', fontSize: '18px' }}
            >
              <Volume2 size={24} />
              <span>শুনক (Listen)</span>
            </button>
          </div>
        </div>

        {/* Freeform Text & Voice Input Section (No Multiple Choice) */}
        {!validationResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '2rem' }}>
            <label style={{ fontSize: '19px', fontWeight: '700', color: 'var(--text-main)' }}>
              আপোনাৰ উত্তৰ দিয়ক (Enter your answer):
            </label>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                placeholder="ইয়াত লিখক বা তলৰ মাইক বুটামত টিপি কওক (Type here or tap microphone)..."
                disabled={isValidating}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  fontSize: '22px',
                  borderRadius: '18px',
                  border: '3px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'border 0.2s'
                }}
              />
            </div>

            {/* Voice Input & Submit Bar */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={toggleListening}
                style={{
                  background: isListening ? '#EF4444' : '#F1F5F9',
                  color: isListening ? '#FFFFFF' : '#1E293B',
                  border: `2px solid ${isListening ? '#DC2626' : '#CBD5E1'}`,
                  borderRadius: '16px',
                  padding: '14px 24px',
                  fontSize: '20px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                <span>{isListening ? 'শুনি আছোঁ... (Listening...)' : '🎙️ মুখেৰে কওক (Speak Answer)'}</span>
              </button>

              <button
                type="button"
                className="btn-large btn-sage"
                onClick={handleValidate}
                disabled={!userAnswer.trim() || isValidating}
                style={{
                  flex: 1,
                  minHeight: '56px',
                  fontSize: '20px',
                  borderRadius: '16px',
                  opacity: !userAnswer.trim() || isValidating ? 0.6 : 1
                }}
              >
                <span>{isValidating ? 'পৰীক্ষা কৰা হৈছে...' : 'উত্তৰ জমা দিয়ক (Submit Answer)'}</span>
                <CheckCircle2 size={24} />
              </button>
            </div>
          </div>
        ) : (
          /* Validation Result with Dignified Empathy */
          <div style={{
            background: validationResult.isCorrect ? 'var(--affirm-green-light)' : '#FEF3C7',
            border: `3px solid ${validationResult.isCorrect ? 'var(--affirm-green)' : '#F59E0B'}`,
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ marginTop: '4px' }}>
                {validationResult.isCorrect ? (
                  <CheckCircle2 size={36} color="var(--affirm-green)" />
                ) : (
                  <Heart size={36} color="#D97706" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '24px',
                  margin: '0 0 8px 0',
                  color: validationResult.isCorrect ? '#065F46' : '#92400E'
                }}>
                  {validationResult.politeMessage}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="speaker-btn"
                    onClick={() => speechService.speak(validationResult.politeMessage, activeLang)}
                    style={{ fontSize: '17px', padding: '6px 14px' }}
                  >
                    <Volume2 size={20} />
                    <span>পুনৰ শুনক (Listen Again)</span>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-large btn-sage"
                onClick={handleNext}
                style={{ minHeight: '60px', padding: '12px 28px', fontSize: '20px', borderRadius: '16px' }}
              >
                <span>পৰৱৰ্তী (Continue)</span>
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
