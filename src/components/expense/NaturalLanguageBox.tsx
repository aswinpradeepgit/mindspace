'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onParse: (text: string) => void;
  parsing: boolean;
}

/** "Type or speak" quick-add box. Voice uses the Web Speech API where available. */
export function NaturalLanguageBox({ onParse, parsing }: Props) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    const SR =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (SR) setVoiceSupported(true);
  }, []);

  const startVoice = () => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new (SR as new () => unknown)();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
      const said = e.results[0][0].transcript;
      setText(said);
      onParse(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const submit = () => {
    if (text.trim()) onParse(text.trim());
  };

  return (
    <div className="glass p-4 space-y-3 border border-purple-500/20">
      <div className="flex items-center gap-2">
        <span className="text-lg">✨</span>
        <p className="text-sm font-bold text-slate-900">Quick add with AI</p>
      </div>
      <p className="text-[11px] text-slate-500 -mt-1">
        Describe it in your own words, e.g. “320 coffee with friends, felt happy”.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={listening ? 'Listening…' : 'Type or tap the mic'}
          className="flex-1 bg-white px-3 py-2.5 text-sm text-slate-900 rounded-xl border border-purple-100 outline-none focus:border-purple-300 placeholder:text-slate-400"
        />
        {voiceSupported && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={startVoice}
            disabled={parsing}
            className={`w-11 rounded-xl flex items-center justify-center text-lg transition-all ${
              listening ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-50 text-purple-600'
            }`}
            aria-label="Speak"
          >
            🎙️
          </motion.button>
        )}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={submit}
        disabled={parsing || !text.trim()}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
          parsing || !text.trim()
            ? 'bg-purple-50/70 text-slate-400'
            : 'bg-purple-600 hover:bg-purple-500 text-white'
        }`}
      >
        {parsing ? 'Reading…' : '✨ Fill with AI'}
      </motion.button>
    </div>
  );
}
