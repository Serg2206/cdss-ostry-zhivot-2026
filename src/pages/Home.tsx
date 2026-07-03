import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import { motion, useInView } from 'framer-motion';
import {
  AlertTriangle,
  Brain,
  ChevronRight,
  Clock,
  Activity,
  Beaker,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Hero from '../components/Hero';
import Features from '../components/Features';

/* ──────────────────────────── easing tokens ──────────────────────────── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ────────────────────────── scroll-reveal hook ───────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  return { ref, inView };
}

/* ═══════════════════ SECTION: Critical Reference Strip ════════════════ */

/* ── qSOFA Calculator sub-component ── */
function QSOFACalculator() {
  const [checks, setChecks] = useState({ hr: false, bp: false, mentation: false });
  const score = (checks.hr ? 1 : 0) + (checks.bp ? 1 : 0) + (checks.mentation ? 1 : 0);

  const toggle = useCallback((key: keyof typeof checks) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const scoreColor = score >= 2 ? 'text-alert-red' : score >= 1 ? 'text-alert-orange' : 'text-success-green';

  return (
    <div className="rounded-lg border-l-[3px] border-alert-red bg-bg-secondary p-5 glow-red">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-alert-red" />
        <h4 className="font-heading text-lg font-semibold text-text-primary">
          qSOFA Score
        </h4>
        <span className="rounded-full bg-alert-red/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-alert-red">
          Live
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {[
          { key: 'hr' as const, label: 'ЧСС \u2265 22/\u043C\u0438\u043D' },
          { key: 'bp' as const, label: '\u0421\u0438\u0441\u0442. \u0410\u0414 \u2264 100 \u043C\u043C \u0440\u0442.\u0441\u0442.' },
          { key: 'mentation' as const, label: '\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0441\u043E\u0437\u043D\u0430\u043D\u0438\u044F' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => toggle(item.key)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left hover:bg-bg-tertiary transition-colors duration-150"
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-150 ${
                checks[item.key]
                  ? 'border-teal-400 bg-teal-400'
                  : 'border-border-subtle bg-bg-tertiary'
              }`}
            >
              {checks[item.key] && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6L5 8.5L9.5 4"
                    stroke="#0B0F14"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm text-text-secondary">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-bg-primary p-3">
        <div>
          <span className={`font-mono-data text-3xl font-medium ${scoreColor}`}>
            {score}
          </span>
          <span className="ml-2 text-xs text-text-muted">/ 3</span>
        </div>
        <span
          className={`text-xs font-medium ${
            score >= 2 ? 'text-alert-red' : score >= 1 ? 'text-alert-orange' : 'text-text-muted'
          }`}
        >
          {score === 0 ? '\u041D\u0438\u0437\u043A\u0438\u0439 \u0440\u0438\u0441\u043A' : score === 1 ? 'Средний риск' : 'Высокий риск сепсиса'}
        </span>
      </div>
    </div>
  );
}

/* ── Critical Biomarker Thresholds ── */
function BiomarkerThresholds() {
  const thresholds = [
    { name: 'PCT', value: '> 2.0', significance: '\u0421\u0435\u043F\u0441\u0438\u0441', color: 'bg-alert-red' },
    { name: 'CRP', value: '> 200', significance: '\u0422\u044F\u0436\u0451\u043B\u044B\u0439 \u041E\u0416', color: 'bg-alert-orange' },
    { name: 'D-\u043B\u0430\u043A\u0442\u0430\u0442', value: '> 3.0', significance: '\u0418\u0448\u0435\u043C\u0438\u044F \u043A\u0438\u0448\u0435\u0447\u043D\u0438\u043A\u0430', color: 'bg-alert-red' },
    { name: 'I-FABP', value: '> 500', significance: '\u041D\u0435\u043A\u0440\u043E\u0437 \u044D\u043D\u0442\u0435\u0440\u043E\u0446\u0438\u0442\u043E\u0432', color: 'bg-alert-red' },
  ];

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-secondary p-5">
      <div className="mb-4 flex items-center gap-2">
        <Beaker className="h-4 w-4 text-alert-orange" />
        <h4 className="font-heading text-lg font-semibold text-text-primary">
          {'\u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043F\u043E\u0440\u043E\u0433\u0438 \u0431\u0438\u043E\u043C\u0430\u0440\u043A\u0435\u0440\u043E\u0432'}
        </h4>
      </div>

      <div className="space-y-2">
        {thresholds.map((t) => (
          <div
            key={t.name}
            className="flex items-center gap-3 rounded-md bg-bg-primary px-3 py-2.5"
          >
            <div className={`h-2 w-2 shrink-0 rounded-full ${t.color}`} />
            <span className="w-20 text-sm font-medium text-text-primary">
              {t.name}
            </span>
            <span className="w-16 text-sm font-mono-data text-alert-red">
              {t.value}
            </span>
            <span className="flex-1 text-right text-xs text-text-secondary">
              {t.significance}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Last Update ── */
function LastUpdate() {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-secondary p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-info-blue" />
        <h4 className="font-heading text-lg font-semibold text-text-primary">
          {'\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435'}
        </h4>
      </div>
      <p className="text-sm font-medium text-text-primary mb-1">
        {'\u0420\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E 2026 \u2014 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043E\u0442 \u043C\u0430\u0440\u0442\u0430 2026'}
      </p>
      <p className="text-sm text-text-secondary mb-4">
        {'\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B \u043D\u043E\u0432\u044B\u0435 \u043C\u0435\u0442\u0430\u0431\u043E\u043B\u043E\u043C\u043D\u044B\u0435 \u0441\u0438\u0433\u043D\u0430\u0442\u0443\u0440\u044B \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0451\u043D\u043D\u044B\u0435 \u043F\u043E\u0440\u043E\u0433\u043E\u0432\u044B\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F IL-10'}
      </p>
      <Link
        to="/biomarkers"
        className="inline-flex items-center gap-1 text-sm font-medium text-teal-400 hover:underline"
      >
        {'\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F'}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function CriticalReferenceStrip() {
  const { ref, inView } = useReveal(0.15);

  return (
    <section
      ref={ref}
      className="border-y border-border-subtle bg-bg-secondary"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            <QSOFACalculator key="qsofa" />,
            <BiomarkerThresholds key="bio" />,
            <LastUpdate key="update" />,
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                ease: easeOutExpo,
                delay: i * 0.1,
              }}
            >
              {card}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ SECTION: Quick Access Bar ════════════════════════ */
const quickLinks = [
  { icon: Sparkles, label: 'TISCPA \u043A\u0430\u0441\u043A\u0430\u0434 \u2014 \u043F\u043E\u043B\u043D\u0430\u044F \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F \u0448\u043A\u0430\u043B\u0430', href: '/molecular' },
  { icon: Beaker, label: 'D-\u043B\u0430\u043A\u0442\u0430\u0442 \u2014 \u043A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440', href: '/biomarkers' },
  { icon: FileText, label: '\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0441\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A', href: '/reference' },
  { icon: Activity, label: '"\u041A\u0438\u043D\u0436\u0430\u043B\u044C\u043D\u0430\u044F \u0431\u043E\u043B\u044C" \u2014 decision tree', href: '/algorithms' },
  { icon: AlertTriangle, label: '\u0414\u041A\u0410 vs \u043F\u0435\u0440\u0438\u0442\u043E\u043D\u0438\u0442 \u2014 \u0434\u0438\u0444\u0444\u0435\u0440\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u0434\u0438\u0430\u0433\u043D\u043E\u0437', href: '/diagnostics' },
  { icon: FileText, label: 'Pre-operative \u0447\u0435\u043A-\u043B\u0438\u0441\u0442', href: '/algorithms' },
  { icon: Brain, label: '\u0422\u0435\u0441\u0442: \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F \u0448\u043A\u0430\u043B\u0430 \u0446\u0438\u0442\u043E\u043A\u0438\u043D\u043E\u0432', href: '/tests' },
];

const recentlyViewed = [
  { label: 'TISCPA \u043A\u0430\u0441\u043A\u0430\u0434', href: '/molecular', color: 'border-teal-400' },
  { label: 'qSOFA \u043A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440', href: '/algorithms', color: 'border-info-blue' },
  { label: '\u041C\u0430\u0441\u043A\u0438 \u041E\u0416', href: '/diagnostics', color: 'border-alert-orange' },
];

function QuickAccessBar() {
  const { ref, inView } = useReveal(0.15);

  return (
    <section ref={ref} className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <span className="mb-6 block text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">
        {'\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F'}
      </span>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left: Frequently accessed */}
        <div>
          <h4 className="mb-4 font-heading text-sm font-semibold text-text-secondary">
            {'\u0427\u0430\u0441\u0442\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C\u043E\u0435'}
          </h4>
          <div className="space-y-1">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.3,
                    ease: easeOutExpo,
                    delay: i * 0.06,
                  }}
                >
                  <Link
                    to={link.href}
                    className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-text-secondary transition-all duration-200 hover:text-text-primary hover:bg-bg-tertiary"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-transparent group-hover:bg-teal-400 transition-colors duration-200" />
                    <Icon className="h-4 w-4 shrink-0 text-text-muted group-hover:text-teal-400 transition-colors duration-200" />
                    <span className="flex-1">{link.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Last visited */}
        <div>
          <h4 className="mb-4 font-heading text-sm font-semibold text-text-secondary">
            {'\u041D\u0435\u0434\u0430\u0432\u043D\u043E \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u043E'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {recentlyViewed.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`inline-flex items-center rounded-full border-l-2 ${item.color} bg-bg-tertiary px-4 py-2 text-xs font-medium text-text-secondary hover:bg-bg-elevated transition-colors duration-150`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ HOME PAGE ══════════════════════════════════ */
export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <CriticalReferenceStrip />
      <QuickAccessBar />
    </div>
  );
}
