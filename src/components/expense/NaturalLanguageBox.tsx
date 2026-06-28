'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onParse: (text: string) => void;
  parsing: boolean;
}

/** "Type or speak" quick-add box.
 *  Native (Capacitor): press-and-hold the mic — uses the native speech recognizer
 *  (requests mic permission). Web: tap the mic — uses the Web Speech API. */
export function NaturalLanguageBox({ onParse, parsing }: Props) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [native, setNative] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const transcriptRef = useRef('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webRec = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          setNative(true);
          setVoiceSupported(true);
          return;
        }
      } catch {
        /* web */
      }
      const SR =
        (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
      if (SR) setVoiceSupported(true);
    })();
  }, []);

  // ── Native: press-and-hold ──────────────────────────────────────────────
  const startNative = async () => {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      const perm = await SpeechRecognition.checkPermissions();
      if (perm.speechRecognition !== 'granted') {
        const req = await SpeechRecognition.requestPermissions();
        if (req.speechRecognition !== 'granted') return;
      }
      transcriptRef.current = '';
      setText('');
      setListening(true);
      await SpeechRecognition.removeAllListeners();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await SpeechRecognition.addListener('partialResults', (data: any) => {
        const m = data?.matches?.[0];
        if (m) {
          transcriptRef.current = m;
          setText(m);
        }
      });
      await SpeechRecognition.start({ language: 'en-IN', partialResults: true, popup: false });
    } catch {
      setListening(false);
    }
  };

  const stopNative = async () => {
    if (!listening) return;
    setListening(false);
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      await SpeechRecognition.stop();
      await SpeechRecognition.removeAllListeners();
    } catch {
      /* ignore */
    }
    const said = transcriptRef.current.trim();
    if (said) onParse(said);
  };

  // ── Web: tap to dictate ─────────────────────────────────────────────────
  const startWeb = () => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new (SR as new () => unknown)();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
      const said = e.results[0][0].transcript;
      setText(said);
      onParse(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    webRec.current = rec;
    setListening(true);
    rec.start();
  };

  const submit = () => {
    if (text.trim()) onParse(text.trim());
  };

  // Press-and-hold handlers (native only).
  const holdProps = native
    ? {
        onPointerDown: (e: React.PointerEvent) => {
          e.preventDefault();
          startNative();
        },
        onPointerUp: () => stopNative(),
        onPointerLeave: () => stopNative(),
        onPointerCancel: () => stopNative(),
        onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
        style: { touchAction: 'none' as const },
      }
    : { onClick: startWeb };

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
          placeholder={listening ? 'Listening…' : native ? 'Type or hold the mic' : 'Type or tap the mic'}
          className="flex-1 bg-white px-3 py-2.5 text-sm text-slate-900 rounded-xl border border-purple-100 outline-none focus:border-purple-300 placeholder:text-slate-400"
        />
        {voiceSupported && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            disabled={parsing}
            aria-label={native ? 'Hold to speak' : 'Speak'}
            className={`w-11 rounded-xl flex items-center justify-center text-lg transition-all select-none ${
              listening ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-50 text-purple-600'
            }`}
            {...holdProps}
          >
            🎙️
          </motion.button>
        )}
      </div>

      {native && (
        <p className="text-[10px] text-slate-400 -mt-1">Hold the mic and speak, release when done.</p>
      )}

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
