'use client';

import { useMemo, useRef, useState } from 'react';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { formatMoney } from '@/lib/money';
import { resolveCategory } from '@/lib/categories';
import { isNative } from '@/lib/nativeAuth';
import { hapticLight } from '@/lib/native';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** A "Share my recap" button that renders a branded recap card off-screen,
 *  snapshots it to a PNG, and opens the native share sheet (or downloads on web). */
export function ShareRecap() {
  const { expenses, profile } = useExpenseStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const recap = useMemo(() => {
    const now = new Date();
    const month = now.toISOString().slice(0, 7);
    const rows = expenses.filter((e) => e.date.startsWith(month));
    const total = rows.reduce((s, e) => s + e.amount, 0);

    const byCat: Record<string, number> = {};
    for (const e of rows) byCat[e.category] = (byCat[e.category] || 0) + e.amount;
    const topId = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a])[0];
    const topCat = topId ? resolveCategory(topId, profile.customCategories) : null;

    return {
      monthLabel: MONTHS[now.getMonth()],
      total,
      count: rows.length,
      topCat,
      topCatAmount: topId ? byCat[topId] : 0,
    };
  }, [expenses, profile.customCategories]);

  const share = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    hapticLight();
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const fileName = `mindspend-recap-${Date.now()}.png`;

      if (isNative()) {
        const base64 = dataUrl.split(',')[1];
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        const res = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Cache,
        });
        await Share.share({
          title: 'My MindSpend recap',
          text: 'My mindful spending recap this month 💸',
          files: [res.uri],
        });
      } else {
        // Web: prefer the native share sheet with the file, else download.
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My MindSpend recap' });
        } else {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = fileName;
          a.click();
        }
      }
    } catch {
      /* user cancelled or capture failed — ignore */
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={share}
        disabled={busy}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-60"
      >
        {busy ? 'Creating…' : '📸 Share my monthly recap'}
      </button>

      {/* Off-screen card that gets snapshotted. 1080×1350 (4:5 social). */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden>
        <div
          ref={cardRef}
          style={{
            width: 1080,
            height: 1350,
            padding: 80,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#1e1b2e',
            background:
              'linear-gradient(150deg, #f4ecff 0%, #fdeef7 45%, #e6fbfb 100%)',
            fontFamily: 'var(--font-sans), system-ui, sans-serif',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 44, fontWeight: 800, color: '#7c5cff' }}>MindSpend</span>
            <span style={{ fontSize: 34, fontWeight: 600, color: '#6b6580' }}>
              {recap.monthLabel} recap
            </span>
          </div>

          <div>
            <p style={{ fontSize: 38, color: '#6b6580', margin: 0 }}>
              {profile.name}, you spent mindfully
            </p>
            <p style={{ fontSize: 130, fontWeight: 800, margin: '8px 0 0', lineHeight: 1 }}>
              {formatMoney(recap.total, profile.currency, { whole: true })}
            </p>
            <p style={{ fontSize: 36, color: '#6b6580', margin: '12px 0 0' }}>
              across {recap.count} mindful {recap.count === 1 ? 'log' : 'logs'} this month
            </p>
          </div>

          <div style={{ display: 'flex', gap: 28 }}>
            <Stat emoji="🔥" value={`${profile.streakDays}`} label="day streak" />
            <Stat emoji="🏆" value={`Lv ${profile.level}`} label="level" />
            {recap.topCat && (
              <Stat emoji={recap.topCat.icon} value={recap.topCat.label} label="top category" />
            )}
          </div>

          <p style={{ fontSize: 34, fontWeight: 600, color: '#7c5cff', margin: 0 }}>
            Track your spending &amp; emotions → MindSpend 💜
          </p>
        </div>
      </div>
    </>
  );
}

function Stat({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(255,255,255,0.65)',
        borderRadius: 28,
        padding: '28px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 52 }}>{emoji}</div>
      <div style={{ fontSize: 40, fontWeight: 800, margin: '8px 0 2px' }}>{value}</div>
      <div style={{ fontSize: 26, color: '#6b6580' }}>{label}</div>
    </div>
  );
}
