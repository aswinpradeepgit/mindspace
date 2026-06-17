import { FinancialTip } from '@/types';

export const TIPS: FinancialTip[] = [
  {
    id: 't1',
    title: 'The 50/30/20 Rule',
    body: 'Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment. This simple framework builds wealth over time.',
    trigger: 'always',
  },
  {
    id: 't2',
    title: 'Try the 24-Hour Rule',
    body: 'Before any non-essential purchase over $50, wait 24 hours. You\'ll often find the urge passes — that\'s impulse buying avoided.',
    trigger: 'impulse_detected',
  },
  {
    id: 't3',
    title: 'Automate Your Savings',
    body: 'Set up an automatic transfer to savings right when your paycheck arrives. Paying yourself first makes saving effortless.',
    trigger: 'always',
  },
  {
    id: 't4',
    title: 'Track Every Rupee',
    body: 'Studies show that people who track spending save 20% more on average. You\'re already doing it — keep it up!',
    trigger: 'always',
  },
  {
    id: 't5',
    title: 'Regret Is Data',
    body: 'When you regret a purchase, that\'s valuable information. Use it to spot patterns and avoid similar decisions in the future.',
    trigger: 'regret_high',
  },
  {
    id: 't6',
    title: 'Emotions Drive Spending',
    body: 'Research shows 80% of purchases are emotionally driven. Recognizing your emotional triggers is the first step to controlling them.',
    trigger: 'impulse_detected',
  },
  {
    id: 't7',
    title: 'The Latte Factor',
    body: 'Small daily purchases add up fast. A $5 coffee every day is $1,825/year. Small changes in habits create massive savings over time.',
    trigger: 'high_spend',
  },
  {
    id: 't8',
    title: 'Build an Emergency Fund',
    body: 'Aim for 3–6 months of expenses in an easily accessible account. This prevents debt when unexpected costs arise.',
    trigger: 'always',
  },
  {
    id: 't9',
    title: 'Celebrate Under-Budget Wins',
    body: 'You stayed under budget today! This is a habit worth celebrating. Each day you do this compounds into significant savings.',
    trigger: 'under_budget',
  },
  {
    id: 't10',
    title: 'Night-Time Spending Alert',
    body: 'Evening is when emotional spending peaks. Shopping late at night? Sleep on it — your morning self will thank you.',
    trigger: 'impulse_detected',
  },
  {
    id: 't11',
    title: 'Needs vs. Wants',
    body: 'Before buying, ask: "If I didn\'t have this for a year, would my life be significantly worse?" That\'s a need. Otherwise, it\'s a want.',
    trigger: 'always',
  },
  {
    id: 't12',
    title: 'Compound Interest Works for You',
    body: 'Every rupee saved today earns interest, and that interest earns more interest. Starting early makes an enormous difference over decades.',
    trigger: 'under_budget',
  },
  {
    id: 't13',
    title: 'Review Subscriptions Monthly',
    body: 'The average person pays for 3–5 subscriptions they no longer use. Schedule a monthly 10-minute audit to cancel unused ones.',
    trigger: 'high_spend',
  },
  {
    id: 't14',
    title: 'Use the Envelope Method',
    body: 'Allocate cash for each category at the start of the month. When the envelope is empty, spending in that category stops for the month.',
    trigger: 'high_spend',
  },
  {
    id: 't15',
    title: 'Invest in Financial Education',
    body: 'Reading one personal finance book can change your relationship with money forever. Try "The Psychology of Money" by Morgan Housel.',
    trigger: 'always',
  },
  {
    id: 't16',
    title: 'Social Pressure Is Real',
    body: 'Peer spending pressure is one of the top reasons people overspend. It\'s okay to say "I\'m saving for something important right now."',
    trigger: 'impulse_detected',
  },
  {
    id: 't17',
    title: 'Your Streak Is Your Superpower',
    body: 'Consistency in tracking is the foundation of financial change. Every day you log builds the habit that transforms your finances.',
    trigger: 'streak_broken',
  },
  {
    id: 't18',
    title: 'Spend on Experiences, Not Things',
    body: 'Research shows experiences bring more lasting happiness than possessions. Prioritize memories over materials.',
    trigger: 'always',
  },
  {
    id: 't19',
    title: 'Buying Time',
    body: 'Calculate purchases in "hours worked" not dollars. A $200 purchase = 5 hours of your time. Is it worth it?',
    trigger: 'high_spend',
  },
  {
    id: 't20',
    title: 'The Power of No',
    body: 'Every "no" to an impulse purchase is a "yes" to your future. Financial freedom is built one conscious decision at a time.',
    trigger: 'regret_high',
  },
];

const tipCooldowns = new Map<string, number>();

export function selectTip(trigger: FinancialTip['trigger']): FinancialTip {
  const now = Date.now();
  const COOLDOWN_MS = 48 * 60 * 60 * 1000;

  const eligible = TIPS.filter((tip) => {
    const lastShown = tipCooldowns.get(tip.id) ?? 0;
    const matchesTrigger = tip.trigger === trigger || tip.trigger === 'always';
    return matchesTrigger && now - lastShown > COOLDOWN_MS;
  });

  const pool = eligible.length > 0 ? eligible : TIPS.filter((t) => t.trigger === 'always');
  const tip = pool[Math.floor(Math.random() * pool.length)];
  tipCooldowns.set(tip.id, now);
  return tip;
}
