import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ChevronDown, ChevronRight, RotateCcw, Calculator,
  AlertTriangle, CheckCircle, XCircle, Activity, Beaker,
  TrendingUp, Info,
} from 'lucide-react';
import ProLock from '../components/ProLock';

// ─── Animation Constants ───
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeInOut = [0.65, 0, 0.35, 1] as [number, number, number, number];

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: easeOutExpo, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

// ─── Types ───
type TabId = 'calculator' | 'thresholds' | 'signatures' | 'dynamics';

interface BiomarkerInput {
  name: string;
  key: string;
  ref: string;
  critical: string;
  unit: string;
  inverse?: boolean;
  description: string;
}

const BIOMARKERS: BiomarkerInput[] = [
  { name: 'D-лактат', key: 'dlactate', ref: '0.5–2.0', critical: '> 3.0', unit: 'mmol/L', description: 'Специфичный маркер ишемии кишечника' },
  { name: 'I-FABP', key: 'ifabp', ref: '< 150', critical: '> 500', unit: 'pg/mL', description: 'Цитоплазматический белок энтероцитов' },
  { name: 'PLA2-II', key: 'pla2', ref: '< 10', critical: '> 30', unit: 'U/mL', description: 'Фосфолипаза A2 группы II' },
  { name: 'HLA-DR', key: 'hladr', ref: '> 60%', critical: '< 30%', unit: '%', inverse: true, description: 'Экспрессия HLA-DR на моноцитах' },
  { name: 'PCT', key: 'pct', ref: '< 0.5', critical: '> 2.0', unit: 'ng/mL', description: 'Прокальцитонин' },
];

// ─── Calculator Severity Logic ───
type Severity = 'normal' | 'mild' | 'moderate' | 'severe';

function getSeverity(key: string, value: number, inverse?: boolean): Severity {
  if (Number.isNaN(value)) return 'normal';
  const v = inverse ? -value : value;
  const thresholds = getThresholds(key);
  if (inverse) {
    if (v > -thresholds.normal) return 'normal';
    if (v > -thresholds.moderate) return 'mild';
    if (v > -thresholds.severe) return 'moderate';
    return 'severe';
  }
  if (v < thresholds.normal) return 'normal';
  if (v < thresholds.moderate) return 'mild';
  if (v < thresholds.severe) return 'moderate';
  return 'severe';
}

function getThresholds(key: string) {
  const map: Record<string, { normal: number; moderate: number; severe: number }> = {
    dlactate: { normal: 0.5, moderate: 2.0, severe: 3.0 },
    ifabp: { normal: 150, moderate: 300, severe: 500 },
    pla2: { normal: 10, moderate: 20, severe: 30 },
    hladr: { normal: 60, moderate: 45, severe: 30 },
    pct: { normal: 0.5, moderate: 2.0, severe: 10 },
  };
  return map[key] || { normal: 1, moderate: 2, severe: 3 };
}

function severityColor(s: Severity): string {
  switch (s) {
    case 'normal': return '#2A9D8F';
    case 'mild': return '#E9C46A';
    case 'moderate': return '#F4A261';
    case 'severe': return '#E84545';
  }
}

function severityBg(s: Severity): string {
  switch (s) {
    case 'normal': return 'bg-success-green/10';
    case 'mild': return 'bg-alert-yellow/10';
    case 'moderate': return 'bg-alert-orange/10';
    case 'severe': return 'bg-alert-red/10';
  }
}

function severityText(s: Severity): string {
  switch (s) {
    case 'normal': return 'Норма';
    case 'mild': return 'Лёгкое отклонение';
    case 'moderate': return 'Умеренное';
    case 'severe': return 'Критическое';
  }
}

function compositeScore(inputs: Record<string, string>): { score: number; severity: Severity; interpretation: string; recommendation: string } {
  let total = 0;
  let count = 0;
  BIOMARKERS.forEach((b) => {
    const v = parseFloat(inputs[b.key] || '');
    if (!Number.isNaN(v)) {
      const s = getSeverity(b.key, v, b.inverse);
      total += s === 'normal' ? 0 : s === 'mild' ? 2.5 : s === 'moderate' ? 5 : 10;
      count++;
    }
  });
  const score = count > 0 ? Math.min(10, total / count * (5 / count)) : 0;
  let severity: Severity = 'normal';
  if (score >= 7) severity = 'severe';
  else if (score >= 4) severity = 'moderate';
  else if (score >= 1.5) severity = 'mild';

  const interpretations: Record<Severity, { text: string; rec: string }> = {
    normal: { text: 'Все показатели в пределах нормы. Острого патологического процесса не выявлено.', rec: 'Продолжать наблюдение. При подозрении на ОЖ — повторить через 6–12 часов.' },
    mild: { text: 'Выявлены незначительные отклонения отдельных маркеров. Требуется динамическое наблюдение.', rec: 'Контроль через 4–6 часов. Корреляция с клинической картиной.' },
    moderate: { text: 'Умеренное повышение ключевых биомаркеров. Возможно сочетание воспалительного и ишемического компонентов.', rec: 'Срочная хирургическая консультация. Дополнительная диагностика (КТ, УЗИ).' },
    severe: { text: 'Критические изменения биомаркеров. Высокая вероятность ишемии кишечника и/или септического осложнения.', rec: 'Немедленная хирургическая консультация. Готовность к экстренному вмешательству.' },
  };

  return { score: Math.round(score * 10) / 10, severity, interpretation: interpretations[severity].text, recommendation: interpretations[severity].rec };
}

// ─── Threshold Table Data ───
const INFLAMMATORY_MARKERS = [
  { name: 'CRP', normal: '< 10', mild: '10–100', moderate: '100–200', severe: '> 200', unit: 'mg/L', note: 'Фазовый белок' },
  { name: 'PCT', normal: '< 0.5', mild: '0.5–2.0', moderate: '2.0–10', severe: '> 10', unit: 'ng/mL', note: 'Бактериальная инфекция' },
  { name: 'IL-6', normal: '< 10', mild: '10–100', moderate: '100–500', severe: '> 500', unit: 'pg/mL', note: 'Ранний маркер' },
  { name: 'TNF-α', normal: '< 20', mild: '20–50', moderate: '50–100', severe: '> 100', unit: 'pg/mL', note: 'Очень ранний' },
  { name: 'IL-10', normal: '< 10', mild: '10–50', moderate: '50–100', severe: '> 100', unit: 'pg/mL', note: 'Анти-воспалительный' },
];

const BARRIER_MARKERS = [
  { name: 'D-лактат', normal: '< 0.5', elevated: '0.5–3.0', critical: '> 3.0', unit: 'mmol/L', note: 'Ишемия кишечника' },
  { name: 'I-FABP', normal: '< 150', elevated: '150–500', critical: '> 500', unit: 'pg/mL', note: 'Некроз энтероцитов' },
  { name: 'Zonulin', normal: '< 30', elevated: '30–50', critical: '> 50', unit: 'ng/mL', note: 'Нарушение TJ' },
  { name: 'Циррулин', normal: '> 20', elevated: '10–20', critical: '< 10', unit: 'µmol/L', note: 'Функция энтероцитов' },
];

const METABOLIC_MARKERS = [
  { name: 'Лактат', normal: '0.5–1.5', change: '↑ 2–10×', unit: 'mmol/L', note: 'Тканевая гипоксия' },
  { name: 'Пируват', normal: '0.05–0.15', change: '↑ 1.5–3×', unit: 'mmol/L', note: 'Анаэробный гликолиз' },
  { name: 'Кетоновые тела', normal: '< 0.5', change: '↑↑ при ДКА', unit: 'mmol/L', note: 'ДКА/голодание' },
  { name: 'Глюкоза', normal: '3.9–5.6', change: 'Переменная', unit: 'mmol/L', note: 'Контекстно-зависимо' },
];

// ─── Radar Chart Data ───
const SIGNATURES = [
  {
    name: 'Перитонит',
    color: '#4ECDC4',
    data: [
      { axis: 'Лактат', value: 85 },
      { axis: 'Пируват', value: 70 },
      { axis: 'CRP', value: 90 },
      { axis: 'PCT', value: 88 },
      { axis: 'IL-6', value: 80 },
      { axis: 'D-лактат', value: 45 },
    ],
    pattern: '↑↑ Лактат, ↑↑ PCT, ↑↑ CRP, норма кетоны',
    brief: 'Выраженный воспалительный ответ с преобладанием бактериальной компоненты',
  },
  {
    name: 'Ишемия кишечника',
    color: '#F4A261',
    data: [
      { axis: 'Лактат', value: 75 },
      { axis: 'Пируват', value: 60 },
      { axis: 'CRP', value: 35 },
      { axis: 'PCT', value: 20 },
      { axis: 'IL-6', value: 40 },
      { axis: 'D-лактат', value: 95 },
    ],
    pattern: '↑↑↑ D-лактат, ↑↑ I-FABP, ↑ Лактат, норма PCT',
    brief: 'Преимущественно ишемический паттерн с минимальным воспалительным ответом на ранних этапах',
  },
  {
    name: 'Диабетический кетоацидоз',
    color: '#E84545',
    data: [
      { axis: 'Лактат', value: 55 },
      { axis: 'Пируват', value: 40 },
      { axis: 'CRP', value: 15 },
      { axis: 'PCT', value: 10 },
      { axis: 'IL-6', value: 20 },
      { axis: 'D-лактат', value: 25 },
    ],
    pattern: '↑↑↑ Кетоны, ↑ Глюкоза, ↑ Лактат, норма PCT/CRP',
    brief: 'Метаболический ацидоз без бактериального воспаления — критически важный дифференциальный диагноз',
    alert: true,
  },
  {
    name: 'Панкреонекроз',
    color: '#9B5DE5',
    data: [
      { axis: 'Лактат', value: 70 },
      { axis: 'Пируват', value: 65 },
      { axis: 'CRP', value: 85 },
      { axis: 'PCT', value: 90 },
      { axis: 'IL-6', value: 88 },
      { axis: 'D-лактат', value: 50 },
    ],
    pattern: '↑↑ Липаза, ↑↑ PCT, ↑↑ IL-6, ↑ Лактат, ↑ CRP',
    brief: 'Комбинированный метаболический и воспалительный паттерн с очень высокими уровнями ферментов',
  },
];

// ─── Trend Chart Data ───
const TREND_HOURS = [0, 6, 12, 24, 48, 72];

interface TrendLine { key: string; name: string; color: string; }

const TREND_LINES: TrendLine[] = [
  { key: 'tnf', name: 'TNF-α', color: '#E84545' },
  { key: 'il6', name: 'IL-6', color: '#E9C46A' },
  { key: 'crp', name: 'CRP', color: '#FF6B6B' },
  { key: 'pct', name: 'PCT', color: '#F15BB5' },
  { key: 'il10', name: 'IL-10', color: '#9B5DE5' },
];

const SCENARIOS: Record<string, string> = {
  peritonit: 'Перитонит',
  ischemia: 'Ишемия',
  pancreatonecrosis: 'Панкреонекроз',
  sepsis: 'Сепсис',
};

function getTrendData(scenario: string) {
  const base = {
    tnf: [95, 40, 20, 10, 8, 5],
    il6: [15, 65, 90, 75, 50, 30],
    crp: [5, 15, 45, 85, 90, 70],
    pct: [8, 35, 70, 80, 55, 35],
    il10: [5, 20, 40, 65, 80, 60],
  };

  const modifiers: Record<string, Partial<Record<string, number[]>>> = {
    ischemia: { crp: [3, 8, 20, 45, 60, 50], pct: [5, 10, 15, 20, 18, 15], il6: [10, 30, 50, 55, 40, 25] },
    pancreatonecrosis: { crp: [10, 40, 70, 95, 100, 85], pct: [15, 55, 85, 95, 80, 55], il6: [20, 70, 95, 90, 75, 50] },
    sepsis: { crp: [8, 30, 55, 80, 85, 65], pct: [20, 60, 85, 90, 70, 45], il6: [25, 75, 95, 85, 60, 35], il10: [10, 35, 60, 80, 90, 75] },
  };

  const mod = modifiers[scenario] || {};
  return TREND_HOURS.map((hour, i) => ({
    hour,
    tnf: mod.tnf?.[i] ?? base.tnf[i],
    il6: mod.il6?.[i] ?? base.il6[i],
    crp: mod.crp?.[i] ?? base.crp[i],
    pct: mod.pct?.[i] ?? base.pct[i],
    il10: mod.il10?.[i] ?? base.il10[i],
  }));
}

// ─── Accordion Data ───
const ACCORDION_DATA = [
  {
    name: 'D-лактат',
    range: '0.006–0.02 mmol/L (норма)',
    description: 'Специфичный маркер ишемии кишечника. Продукт бактериального метаболизма, практически не всасывается в норме.',
    details: [
      { label: 'Молекулярная масса', value: '90 Да' },
      { label: 'Норма', value: '0.006–0.02 ммоль/л' },
      { label: 'Порог ОЖ', value: '> 0.5 ммоль/л' },
      { label: 'Критический', value: '> 3.0 ммоль/л' },
      { label: 'AUC диагностики', value: '0.89' },
    ],
    clinical: [
      'Ранняя диагностика ишемии кишечника',
      'Мониторинг перфузии при сепсисе',
      'Дифференциация механической и паралитической непроходимости',
    ],
  },
  {
    name: 'I-FABP',
    range: '< 150 pg/mL',
    description: 'Intestinal fatty acid binding protein — цитоплазматический белок энтероцитов. Высвобождается при повреждении кишечной стенки.',
    details: [
      { label: 'Молекулярная масса', value: '15 кДа' },
      { label: 'T1/2 плазмы', value: '~11 мин' },
      { label: 'AUC (мета-анализ)', value: '0.86' },
      { label: 'AUC (SURVIBIO)', value: '0.44' },
      { label: 'Порог', value: '> 150–500 pg/mL' },
    ],
    clinical: [
      'Оценка целостности кишечного барьера',
      'Прогноз при острой кишечной ишемии',
      'Ранняя маркировка некроза энтероцитов',
    ],
  },
  {
    name: 'PLA2-II',
    range: '< 10 U/mL',
    description: 'Фосфолипаза A2 группы II — ключевой фермент воспалительного каскада, активируется при панкреатите и перитоните.',
    details: [
      { label: 'Молекулярная масса', value: '13–15 кДа' },
      { label: 'Пик концентрации', value: 'день 2–3' },
      { label: 'Порог', value: '> 10 U/mL' },
      { label: 'Критический', value: '> 280–300 ng/mL' },
      { label: 'Специфичность', value: 'Высокая при панкреатите' },
    ],
    clinical: [
      'Диагностика острого панкреатита',
      'Дифференциация брюшной боли',
      'Оценка тяжести панкреонекроза',
    ],
  },
  {
    name: 'HLA-DR',
    range: '13,500–40,000 AB/C',
    description: 'Экспрессия HLA-DR на моноцитах — маркёр иммунного статуса. Снижение < 8000 AB/C ассоциировано с иммунопараличом и сепсисом.',
    details: [
      { label: 'Норма', value: '13,500–40,000 AB/C' },
      { label: 'Иммунопаралич', value: '< 8,000 AB/C' },
      { label: 'Критический', value: '< 30% экспрессии' },
      { label: 'Интерпретация', value: 'Обратная зависимость' },
      { label: 'Прогностика', value: 'Высокая при сепсисе' },
    ],
    clinical: [
      'Оценка иммунного статуса при сепсисе',
      'Выявление иммунопаралича',
      'Персонализация иммунотерапии',
    ],
  },
  {
    name: 'PCT',
    range: '< 0.5 ng/mL',
    description: 'Прокальцитонин — специфичный маркёр бактериальной инфекции. Не повышается при вирусных инфекциях и стерильном воспалении.',
    details: [
      { label: 'Норма', value: '< 0.5 ng/mL' },
      { label: 'Умеренное', value: '0.5–2.0 ng/mL' },
      { label: 'Выраженное', value: '2.0–10 ng/mL' },
      { label: 'Критическое', value: '> 10 ng/mL' },
      { label: 'Специфичность', value: 'Высокая (бактериальная)' },
    ],
    clinical: [
      'Дифференциация бактериальной/вирусной инфекции',
      'Руководство антибиотикотерапией',
      'Мониторинг ответа на лечение',
    ],
  },
];

// ─── Severity Bar Component ───
function SeverityBar({ value, biomarkerKey, inverse }: { value: number; biomarkerKey: string; inverse?: boolean }) {
  const thresholds = getThresholds(biomarkerKey);
  const max = thresholds.severe * 1.5;
  const pct = inverse
    ? Math.max(0, Math.min(100, (value / thresholds.severe) * 100))
    : Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="relative h-2 w-full rounded-full overflow-hidden bg-bg-tertiary mt-2">
      <div className="absolute inset-0 flex">
        <div className="h-full bg-success-green/30" style={{ width: inverse ? '60%' : `${(thresholds.normal / max) * 100}%` }} />
        <div className="h-full bg-alert-yellow/30" style={{ width: inverse ? '20%' : `${((thresholds.moderate - thresholds.normal) / max) * 100}%` }} />
        <div className="h-full bg-alert-orange/30" style={{ width: inverse ? '10%' : `${((thresholds.severe - thresholds.moderate) / max) * 100}%` }} />
        <div className="h-full bg-alert-red/30" style={{ flex: 1 }} />
      </div>
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-teal-400 shadow-glow-teal"
        animate={{ left: `calc(${Math.min(100, Math.max(0, pct))}% - 6px)` }}
        transition={{ duration: 0.3, ease: easeOutExpo }}
      />
    </div>
  );
}

// ─── Gauge Component ───
function SeverityGauge({ score, severity }: { score: number; severity: Severity }) {
  const pct = (score / 10) * 100;
  const color = severityColor(severity);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#25303D" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="52" fill="none" stroke={color}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: easeOutExpo }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono-data text-data-lg text-text-primary">{score}</span>
          <span className="text-body-sm text-text-muted">/ 10</span>
        </div>
      </div>
      <span className="mt-2 text-body-sm font-medium" style={{ color }}>{severityText(severity)}</span>
    </div>
  );
}

// ─── Threshold Table Components ───
function Dot({ color }: { color: string }) {
  return (
    <motion.span
      className="inline-block w-2 h-2 rounded-full mr-1"
      style={{ backgroundColor: color }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, ease: easeOutExpo }}
    />
  );
}

function InflammatoryTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-sm">
        <thead>
          <tr className="bg-bg-tertiary text-text-muted uppercase text-label">
            <th className="text-left px-4 py-3 rounded-tl-md">Биомаркер</th>
            <th className="text-left px-4 py-3"><Dot color="#2A9D8F" />Норма</th>
            <th className="text-left px-4 py-3"><Dot color="#E9C46A" />Умеренное</th>
            <th className="text-left px-4 py-3"><Dot color="#F4A261" />Выраженное</th>
            <th className="text-left px-4 py-3"><Dot color="#E84545" />Критическое</th>
            <th className="text-left px-4 py-3">Ед.</th>
            <th className="text-left px-4 py-3 rounded-tr-md">Примечание</th>
          </tr>
        </thead>
        <tbody>
          {INFLAMMATORY_MARKERS.map((row, i) => (
            <motion.tr
              key={row.name}
              className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors duration-150"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: easeOutExpo }}
            >
              <td className="px-4 py-3 font-medium text-text-primary">{row.name}</td>
              <td className="px-4 py-3 text-success-green">{row.normal}</td>
              <td className="px-4 py-3 text-alert-yellow">{row.mild}</td>
              <td className="px-4 py-3 text-alert-orange">{row.moderate}</td>
              <td className="px-4 py-3 text-alert-red">{row.severe}</td>
              <td className="px-4 py-3 text-text-muted">{row.unit}</td>
              <td className="px-4 py-3 text-text-muted">{row.note}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarrierTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-sm">
        <thead>
          <tr className="bg-bg-tertiary text-text-muted uppercase text-label">
            <th className="text-left px-4 py-3 rounded-tl-md">Биомаркер</th>
            <th className="text-left px-4 py-3"><Dot color="#2A9D8F" />Норма</th>
            <th className="text-left px-4 py-3"><Dot color="#E9C46A" />Повышенный</th>
            <th className="text-left px-4 py-3"><Dot color="#E84545" />Критический</th>
            <th className="text-left px-4 py-3">Ед.</th>
            <th className="text-left px-4 py-3 rounded-tr-md">Клиническое значение</th>
          </tr>
        </thead>
        <tbody>
          {BARRIER_MARKERS.map((row, i) => (
            <motion.tr
              key={row.name}
              className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors duration-150"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: easeOutExpo }}
            >
              <td className="px-4 py-3 font-medium text-text-primary">{row.name}</td>
              <td className="px-4 py-3 text-success-green">{row.normal}</td>
              <td className="px-4 py-3 text-alert-yellow">{row.elevated}</td>
              <td className="px-4 py-3 text-alert-red">{row.critical}</td>
              <td className="px-4 py-3 text-text-muted">{row.unit}</td>
              <td className="px-4 py-3 text-text-muted">{row.note}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetabolicTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-sm">
        <thead>
          <tr className="bg-bg-tertiary text-text-muted uppercase text-label">
            <th className="text-left px-4 py-3 rounded-tl-md">Биомаркер</th>
            <th className="text-left px-4 py-3">Норма</th>
            <th className="text-left px-4 py-3">Изменение при ОЖ</th>
            <th className="text-left px-4 py-3">Ед.</th>
            <th className="text-left px-4 py-3 rounded-tr-md">Интерпретация</th>
          </tr>
        </thead>
        <tbody>
          {METABOLIC_MARKERS.map((row, i) => (
            <motion.tr
              key={row.name}
              className="border-b border-border-subtle hover:bg-bg-tertiary/50 transition-colors duration-150"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: easeOutExpo }}
            >
              <td className="px-4 py-3 font-medium text-text-primary">{row.name}</td>
              <td className="px-4 py-3 text-success-green">{row.normal}</td>
              <td className="px-4 py-3 text-alert-orange font-medium">{row.change}</td>
              <td className="px-4 py-3 text-text-muted">{row.unit}</td>
              <td className="px-4 py-3 text-text-muted">{row.note}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page Component ───
export default function Biomarkers() {
  const [activeTab, setActiveTab] = useState<TabId>('calculator');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [calculated, setCalculated] = useState(false);
  const [thresholdTab, setThresholdTab] = useState<'inflammatory' | 'barrier' | 'metabolic'>('inflammatory');
  const [scenario, setScenario] = useState('peritonit');
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    tnf: true, il6: true, crp: true, pct: true, il10: true,
  });
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const handleInputChange = useCallback((key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setCalculated(false);
  }, []);

  const resetInputs = useCallback(() => {
    setInputs({});
    setCalculated(false);
  }, []);

  const result = useMemo(() => compositeScore(inputs), [inputs]);
  const trendData = useMemo(() => getTrendData(scenario), [scenario]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'calculator', label: 'Калькулятор' },
    { id: 'thresholds', label: 'Пороговые значения' },
    { id: 'signatures', label: 'Метаболомные сигнатуры' },
    { id: 'dynamics', label: 'Динамика' },
  ];

  return (
    <div className="min-h-[100dvh]">
      {/* ═══════ SECTION 1: Page Header ═══════ */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-16 pb-8">
        <motion.p
          className="text-body-sm text-text-muted mb-3"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          Главная / Модули / Биомаркерная навигация
        </motion.p>

        <motion.h1
          className="font-heading text-display-lg font-semibold text-text-primary mb-4"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          Биомаркерная навигация
        </motion.h1>

        <motion.p
          className="text-body-lg text-text-secondary max-w-[680px] mb-8"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
        >
          Калькуляторы биомаркеров, пороговые значения, метаболомные сигнатуры и динамика показателей для диагностики острого живота
        </motion.p>

        {/* Module Tabs */}
        <motion.div
          className="flex flex-wrap gap-1 border-b border-border-subtle"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-4 py-3 text-sm font-medium transition-colors duration-150"
              style={{ color: activeTab === tab.id ? '#E8ECF0' : '#5E6E80' }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="biomarker-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400"
                  transition={{ duration: 0.3, ease: easeInOut }}
                />
              )}
            </button>
          ))}
        </motion.div>
      </section>

      {/* ═══════ SECTION 2: Calculator (Pro) ═══════ */}
      <AnimatePresence mode="wait">
        {activeTab === 'calculator' && (
          <motion.section
            key="calculator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProLock
              featureName="Биомаркерный калькулятор"
              description="Расчёт интегрального индекса, интерпретация биомаркеров и дифференциальная диагностика на основе молекулярных данных"
            >
            <div className="bg-bg-secondary border-t border-border-subtle py-10 px-4 sm:px-6">
              <div className="max-w-[1200px] mx-auto">
                <motion.p
                  className="text-label text-teal-400 mb-2 tracking-widest uppercase"
                  variants={fadeInUp} initial="hidden" whileInView="visible" custom={0}
                  viewport={{ once: true }}
                >
                  КАЛЬКУЛЯТОР
                </motion.p>
                <motion.h2
                  className="font-heading text-display-md font-semibold text-text-primary mb-2"
                  variants={fadeInUp} initial="hidden" whileInView="visible" custom={0.05}
                  viewport={{ once: true }}
                >
                  Расчёт и интерпретация биомаркеров
                </motion.h2>
                <motion.p
                  className="text-body-md text-text-secondary mb-8"
                  variants={fadeInUp} initial="hidden" whileInView="visible" custom={0.1}
                  viewport={{ once: true }}
                >
                  Введите значения биомаркеров для автоматической интерпретации, расчёта интегрального индекса и дифференциальной диагностики.
                </motion.p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Input Panel */}
                  <motion.div
                    className="bg-bg-primary rounded-md border border-border-subtle p-6"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: easeOutExpo }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="heading-md text-text-primary">Введите значения</h3>
                      <button
                        onClick={resetInputs}
                        className="flex items-center gap-1 text-body-sm text-text-muted hover:text-teal-400 transition-colors duration-150"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Сбросить
                      </button>
                    </div>

                    <div className="space-y-5">
                      {BIOMARKERS.map((b) => (
                        <div key={b.key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-body-md font-medium text-text-primary">{b.name}</label>
                            <span className="text-body-sm text-text-muted">
                              {b.inverse ? 'Крит: ' + b.critical : 'Норма: ' + b.ref}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="any"
                              value={inputs[b.key] || ''}
                              onChange={(e) => handleInputChange(b.key, e.target.value)}
                              placeholder="Введите значение"
                              className="flex-1 h-12 px-4 rounded-md bg-bg-tertiary border border-border-subtle text-text-primary placeholder:text-text-muted outline-none transition-all duration-150 focus:border-teal-400 focus:shadow-glow-teal text-body-md"
                            />
                            <span className="flex items-center px-3 h-12 rounded-md bg-bg-secondary border border-border-subtle text-body-sm text-text-muted">
                              {b.unit}
                            </span>
                          </div>
                          {inputs[b.key] && !Number.isNaN(parseFloat(inputs[b.key])) && (
                            <SeverityBar
                              value={parseFloat(inputs[b.key])}
                              biomarkerKey={b.key}
                              inverse={b.inverse}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setCalculated(true)}
                      className="w-full mt-6 h-[52px] rounded-md bg-teal-400 text-text-inverse font-semibold text-heading-md hover:bg-teal-500 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2"
                    >
                      <Calculator className="w-5 h-5" />
                      Рассчитать интерпретацию
                    </button>
                  </motion.div>

                  {/* Results Panel */}
                  <div>
                    <AnimatePresence>
                      {calculated && (
                        <motion.div
                          initial={{ opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 24 }}
                          transition={{ duration: 0.5, ease: easeOutExpo }}
                          className="space-y-4"
                        >
                          {/* Overall Status */}
                          <div className={`rounded-full px-5 py-3 inline-flex items-center gap-2 ${severityBg(result.severity)} border-l-4`}
                            style={{ borderLeftColor: severityColor(result.severity) }}
                          >
                            {result.severity === 'severe' ? <XCircle className="w-5 h-5" style={{ color: severityColor(result.severity) }} /> :
                              result.severity === 'normal' ? <CheckCircle className="w-5 h-5" style={{ color: severityColor(result.severity) }} /> :
                                <AlertTriangle className="w-5 h-5" style={{ color: severityColor(result.severity) }} />}
                            <span className="heading-md" style={{ color: severityColor(result.severity) }}>
                              {result.severity === 'severe' ? 'Высокий риск' : result.severity === 'moderate' ? 'Умеренный риск' : result.severity === 'mild' ? 'Лёгкое отклонение' : 'Норма'}
                            </span>
                          </div>

                          {/* Individual Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {BIOMARKERS.map((b, i) => {
                              const v = parseFloat(inputs[b.key] || '');
                              const s = getSeverity(b.key, v, b.inverse);
                              return (
                                <motion.div
                                  key={b.key}
                                  className="bg-bg-secondary rounded-md border border-border-subtle p-4"
                                  style={{ borderLeft: `3px solid ${severityColor(s)}` }}
                                  initial={{ opacity: 0, x: 16 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.08, duration: 0.4, ease: easeOutExpo }}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-body-sm font-medium text-text-primary">{b.name}</span>
                                    {s === 'normal' ? <CheckCircle className="w-4 h-4 text-success-green" /> :
                                      s === 'severe' ? <XCircle className="w-4 h-4 text-alert-red" /> :
                                        <AlertTriangle className="w-4 h-4" style={{ color: severityColor(s) }} />}
                                  </div>
                                  <div className="font-mono-data text-data-md text-text-primary">
                                    {Number.isNaN(v) ? '—' : `${v} ${b.unit}`}
                                  </div>
                                  <div className="text-body-sm mt-1" style={{ color: severityColor(s) }}>
                                    {severityText(s)}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Composite Index */}
                          <motion.div
                            className="bg-bg-secondary rounded-md border border-border-subtle p-6"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5, ease: easeOutExpo }}
                          >
                            <div className="flex items-center gap-6">
                              <SeverityGauge score={result.score} severity={result.severity} />
                              <div className="flex-1">
                                <h4 className="heading-md text-text-primary mb-2">Интегральная оценка</h4>
                                <p className="text-body-md text-text-secondary mb-3">{result.interpretation}</p>
                                <div className="flex items-start gap-2">
                                  <Info className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-body-md font-medium text-teal-400">{result.recommendation}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!calculated && (
                      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-text-muted">
                        <Activity className="w-12 h-12 mb-4 opacity-30" />
                        <p className="text-body-md">Введите значения биомаркеров и нажмите «Рассчитать»</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </ProLock>
          </motion.section>
        )}

        {/* ═══════ SECTION 3: Threshold Tables (Free) ═══════ */}
        {activeTab === 'thresholds' && (
          <motion.section
            key="thresholds"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10"
          >
            <motion.p
              className="text-label text-teal-400 mb-2 tracking-widest uppercase"
              variants={fadeInUp} initial="hidden" whileInView="visible" custom={0}
              viewport={{ once: true }}
            >
              ПОРОГОВЫЕ ЗНАЧЕНИЯ
            </motion.p>
            <motion.h2
              className="font-heading text-display-md font-semibold text-text-primary mb-8"
              variants={fadeInUp} initial="hidden" whileInView="visible" custom={0.05}
              viewport={{ once: true }}
            >
              Справочник пороговых значений биомаркеров
            </motion.h2>

            {/* Threshold Tabs */}
            <div className="flex gap-2 mb-6">
              {([
                { key: 'inflammatory', label: 'Воспалительные' },
                { key: 'barrier', label: 'Барьерные' },
                { key: 'metabolic', label: 'Метаболические' },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setThresholdTab(t.key)}
                  className={`px-4 py-2 rounded-md text-body-sm font-medium transition-all duration-150 ${
                    thresholdTab === t.key
                      ? 'bg-teal-400 text-text-inverse'
                      : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tables */}
            <AnimatePresence mode="wait">
              <motion.div
                key={thresholdTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-bg-secondary rounded-md border border-border-subtle p-4"
              >
                {thresholdTab === 'inflammatory' && <InflammatoryTable />}
                {thresholdTab === 'barrier' && <BarrierTable />}
                {thresholdTab === 'metabolic' && <MetabolicTable />}
              </motion.div>
            </AnimatePresence>

            {/* Section 6: Quick Guide (shown in thresholds tab as well for access) */}
            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="font-heading text-heading-lg font-semibold text-text-primary mb-6">
                Краткий справочник: ключевые биомаркеры
              </h3>
              <AccordionGuide openAccordion={openAccordion} setOpenAccordion={setOpenAccordion} />
            </motion.div>
          </motion.section>
        )}

        {/* ═══════ SECTION 4: Metabolomic Signatures ═══════ */}
        {activeTab === 'signatures' && (
          <motion.section
            key="signatures"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-bg-secondary border-t border-border-subtle py-10 px-4 sm:px-6"
          >
            <div className="max-w-[1200px] mx-auto">
              <motion.p
                className="text-label text-teal-400 mb-2 tracking-widest uppercase"
                variants={fadeInUp} initial="hidden" whileInView="visible" custom={0}
                viewport={{ once: true }}
              >
                МЕТАБОЛОМНЫЕ СИГНАТУРЫ
              </motion.p>
              <motion.h2
                className="font-heading text-display-md font-semibold text-text-primary mb-2"
                variants={fadeInUp} initial="hidden" whileInView="visible" custom={0.05}
                viewport={{ once: true }}
              >
                Метаболомные профили при остром животе
              </motion.h2>
              <motion.p
                className="text-body-md text-text-secondary mb-8"
                variants={fadeInUp} initial="hidden" whileInView="visible" custom={0.1}
                viewport={{ once: true }}
              >
                Характерные паттерны изменений метаболитов, позволяющие дифференцировать основные формы острого живота.
              </motion.p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {SIGNATURES.map((sig, i) => (
                  <motion.div
                    key={sig.name}
                    className="bg-bg-primary rounded-md border border-border-subtle p-5"
                    style={{ borderTop: `3px solid ${sig.color}` }}
                    variants={staggerItem}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="heading-lg text-text-primary">{sig.name}</h3>
                      {sig.alert && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-alert-red/10 text-alert-red text-label border border-alert-red/20">
                          <AlertTriangle className="w-3 h-3" />
                          Маска ОЖ
                        </span>
                      )}
                    </div>

                    <div className="h-[240px] mb-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={sig.data}>
                          <PolarGrid stroke="#25303D" />
                          <PolarAngleAxis
                            dataKey="axis"
                            tick={{ fill: '#94A3B8', fontSize: 11 }}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: '#5E6E80', fontSize: 10 }}
                          />
                          <Radar
                            name={sig.name}
                            dataKey="value"
                            stroke={sig.color}
                            fill={sig.color}
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-body-sm font-medium mb-1" style={{ color: sig.color }}>
                      {sig.pattern}
                    </p>
                    <p className="text-body-sm text-text-secondary">{sig.brief}</p>
                  </motion.div>
                ))}
              </div>

              {/* Metabolomics stats */}
              <motion.div
                className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { label: '13-метаболитная панель', value: 'AUC 0.89', desc: 'Диагностическая точность' },
                  { label: 'CatBoost + SHAP', value: 'AUC 0.969', desc: 'ML-модель интерпретации' },
                  { label: 'Валидация', value: 'n = 156', desc: 'Пациенты с острым животом' },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="bg-bg-primary rounded-md border border-border-subtle p-5 text-center"
                    variants={staggerItem}
                  >
                    <p className="text-label text-text-muted mb-1">{stat.label}</p>
                    <p className="font-mono-data text-data-lg text-teal-400 mb-1">{stat.value}</p>
                    <p className="text-body-sm text-text-muted">{stat.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* ═══════ SECTION 5: Trend Visualization ═══════ */}
        {activeTab === 'dynamics' && (
          <motion.section
            key="dynamics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10"
          >
            <motion.p
              className="text-label text-teal-400 mb-2 tracking-widest uppercase"
              variants={fadeInUp} initial="hidden" whileInView="visible" custom={0}
              viewport={{ once: true }}
            >
              ДИНАМИКА
            </motion.p>
            <motion.h2
              className="font-heading text-display-md font-semibold text-text-primary mb-2"
              variants={fadeInUp} initial="hidden" whileInView="visible" custom={0.05}
              viewport={{ once: true }}
            >
              Типичные кривые динамики биомаркеров
            </motion.h2>
            <motion.p
              className="text-body-md text-text-secondary mb-6"
              variants={fadeInUp} initial="hidden" whileInView="visible" custom={0.1}
              viewport={{ once: true }}
            >
              Динамика ключевых биомаркеров во времени при различных формах острого живота.
            </motion.p>

            {/* Scenario Selector */}
            <motion.div
              className="flex items-center gap-3 mb-4"
              variants={fadeInUp} initial="hidden" whileInView="visible" custom={0.15}
              viewport={{ once: true }}
            >
              <span className="text-body-sm text-text-muted">Сценарий:</span>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="h-10 px-4 rounded-md bg-bg-secondary border border-border-subtle text-text-primary text-body-sm outline-none focus:border-teal-400 transition-colors duration-150"
              >
                {Object.entries(SCENARIOS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </motion.div>

            {/* Legend Checkboxes */}
            <div className="flex flex-wrap gap-3 mb-4">
              {TREND_LINES.map((line) => (
                <button
                  key={line.key}
                  onClick={() => setVisibleLines((prev) => ({ ...prev, [line.key]: !prev[line.key] }))}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-body-sm transition-all duration-200"
                  style={{
                    backgroundColor: visibleLines[line.key] ? `${line.color}15` : 'transparent',
                    border: `1px solid ${visibleLines[line.key] ? line.color : '#25303D'}`,
                    color: visibleLines[line.key] ? line.color : '#5E6E80',
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full transition-opacity duration-200"
                    style={{
                      backgroundColor: line.color,
                      opacity: visibleLines[line.key] ? 1 : 0.3,
                    }}
                  />
                  {line.name}
                </button>
              ))}
            </div>

            {/* Line Chart */}
            <motion.div
              className="bg-bg-secondary rounded-md border border-border-subtle p-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#25303D" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    stroke="#25303D"
                    label={{ value: 'Время (часы)', position: 'insideBottomRight', offset: -5, fill: '#5E6E80', fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    stroke="#25303D"
                    domain={[0, 100]}
                    label={{ value: '% от пика', angle: -90, position: 'insideLeft', fill: '#5E6E80', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1D2630',
                      border: '1px solid #25303D',
                      borderRadius: '10px',
                      color: '#E8ECF0',
                    }}
                    itemStyle={{ fontSize: 13 }}
                    labelFormatter={(v) => `${v} ч`}
                  />
                  {TREND_LINES.map((line) => (
                    visibleLines[line.key] && (
                      <Line
                        key={line.key}
                        type="monotone"
                        dataKey={line.key}
                        name={line.name}
                        stroke={line.color}
                        strokeWidth={2}
                        dot={{ r: 4, fill: line.color, strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                        animationDuration={600}
                        animationEasing="ease-in-out"
                      />
                    )
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Biomarker curve descriptions */}
            <motion.div
              className="mt-6 grid grid-cols-1 sm:grid-cols-5 gap-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { name: 'TNF-α', color: '#E84545', desc: 'Пик 0–2ч, быстрое снижение' },
                { name: 'IL-6', color: '#E9C46A', desc: 'Пик 4–12ч' },
                { name: 'CRP', color: '#FF6B6B', desc: 'Пик 12–24ч, затяжной' },
                { name: 'PCT', color: '#F15BB5', desc: 'Пик 6–24ч' },
                { name: 'IL-10', color: '#9B5DE5', desc: 'Задержанный пик 6–48ч' },
              ].map((item) => (
                <motion.div
                  key={item.name}
                  className="bg-bg-secondary rounded-md border border-border-subtle p-3 text-center"
                  variants={staggerItem}
                >
                  <p className="font-medium text-body-sm mb-1" style={{ color: item.color }}>{item.name}</p>
                  <p className="text-body-sm text-text-muted">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Accordion Sub-Component ───
function AccordionGuide({ openAccordion, setOpenAccordion }: {
  openAccordion: number | null;
  setOpenAccordion: (i: number | null) => void;
}) {
  const toggle = (i: number) => setOpenAccordion(openAccordion === i ? null : i);

  return (
    <div className="space-y-2">
      {ACCORDION_DATA.map((item, i) => (
        <motion.div
          key={item.name}
          className="bg-bg-secondary rounded-md border border-border-subtle overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: easeOutExpo }}
        >
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-bg-tertiary/50 transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <Beaker className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span className="heading-md text-text-primary">{item.name}</span>
              <span className="text-body-sm text-text-muted hidden sm:inline">— {item.range}</span>
            </div>
            <motion.div
              animate={{ rotate: openAccordion === i ? 180 : 0 }}
              transition={{ duration: 0.3, ease: easeInOut }}
            >
              <ChevronDown className="w-5 h-5 text-text-muted" />
            </motion.div>
          </button>

          <AnimatePresence>
            {openAccordion === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: easeInOut }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 border-t border-border-subtle pt-4 space-y-4">
                  <p className="text-body-md text-text-secondary">{item.description}</p>

                  {/* Details Table */}
                  <div className="bg-bg-primary rounded-md p-4">
                    <h5 className="text-label text-teal-400 mb-3 uppercase">Параметры</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {item.details.map((d) => (
                        <div key={d.label} className="flex justify-between text-body-sm">
                          <span className="text-text-muted">{d.label}</span>
                          <span className="text-text-primary font-medium">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Usage */}
                  <div>
                    <h5 className="text-label text-teal-400 mb-2 uppercase flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Клиническое применение
                    </h5>
                    <ul className="space-y-1">
                      {item.clinical.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-body-sm text-text-secondary">
                          <ChevronRight className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key data from guide */}
                  {item.name === 'D-лактат' && (
                    <div className="bg-bg-primary rounded-md p-4 border-l-3 border-teal-400" style={{ borderLeft: '3px solid #4ECDC4' }}>
                      <p className="text-body-sm text-text-secondary">
                        <span className="text-teal-400 font-medium">Ключевое значение:</span> Норма 0.006–0.02 ммоль/л,
                        пороговое &gt; 0.5 ммоль/л. Специфичность для ишемии кишечника — 89%.
                      </p>
                    </div>
                  )}
                  {item.name === 'I-FABP' && (
                    <div className="bg-bg-primary rounded-md p-4" style={{ borderLeft: '3px solid #F4A261' }}>
                      <p className="text-body-sm text-text-secondary">
                        <span className="text-alert-orange font-medium">15 кДа, T₁/₂ ~11 мин.</span> AUC 0.86 (мета-анализ) vs 0.44 (SURVIBIO).
                        Оптимальный порог 150–500 pg/mL.
                      </p>
                    </div>
                  )}
                  {item.name === 'PLA2-II' && (
                    <div className="bg-bg-primary rounded-md p-4" style={{ borderLeft: '3px solid #9B5DE5' }}>
                      <p className="text-body-sm text-text-secondary">
                        <span className="text-purple-accent font-medium">13–15 кДа, пик день 2–3.</span> Порог &gt; 280–300 ng/mL.
                        Высокая специфичность при панкреатите.
                      </p>
                    </div>
                  )}
                  {item.name === 'HLA-DR' && (
                    <div className="bg-bg-primary rounded-md p-4" style={{ borderLeft: '3px solid #E84545' }}>
                      <p className="text-body-sm text-text-secondary">
                        <span className="text-alert-red font-medium">Норма 13,500–40,000 AB/C.</span> Иммунопаралич &lt; 8,000 AB/C
                        ассоциирован с сепсисом и неблагоприятным исходом.
                      </p>
                    </div>
                  )}
                  {item.name === 'PCT' && (
                    <div className="bg-bg-primary rounded-md p-4" style={{ borderLeft: '3px solid #F15BB5' }}>
                      <p className="text-body-sm text-text-secondary">
                        <span className="text-pink-accent font-medium">Специфичен для бактериальной инфекции.</span> Не повышается
                        при вирусных инфекциях. Порог сепсиса &gt; 2.0 ng/mL.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
