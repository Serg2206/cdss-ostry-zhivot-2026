import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  ChevronRight,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CytokineNode {
  id: string;
  name: string;
  shortName: string;
  color: string;
  timeWindow: string;
  peakHours: string;
  description: string;
  clinicalSignificance: string[];
  thresholds: { normal: string; elevated: string; critical: string };
  peakValue: number;
  unit: string;
  type: string;
}

interface PathwayBlock {
  id: string;
  label: string;
  color: string;
  description: string;
}

interface TableMarker {
  name: string;
  type: string;
  peak: string;
  threshold: string;
  significance: string;
  module: string;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Constants - Cytokine cascade colour map from design.md             */
/* ------------------------------------------------------------------ */

const CYTOKINES: CytokineNode[] = [
  {
    id: 'tnf-a',
    name: 'TNF-\u03B1',
    shortName: 'TNF-\u03B1',
    color: '#E84545',
    timeWindow: '0\u20132 \u0447',
    peakHours: '0\u20132 \u0447',
    description:
      'Фактор некроза опухоли-альфа — один из самых ранних и ключевых провоспалительных цитокинов, высвобождаемых макрофагами в ответ на повреждение ткани. Инициирует воспалительный каскад и стимулирует продукцию других цитокинов.',
    clinicalSignificance: [
      'Ранний индикатор острого воспалительного ответа',
      'Стимулирует продукцию IL-1\u03B2 и IL-6',
      'Уровень коррелирует с тяжестью перитонита',
    ],
    thresholds: { normal: '< 25 pg/mL', elevated: '25\u201350 pg/mL', critical: '> 50 pg/mL' },
    peakValue: 85,
    unit: 'pg/mL',
    type: 'Провоспалительный',
  },
  {
    id: 'il-1b',
    name: 'IL-1\u03B2',
    shortName: 'IL-1\u03B2',
    color: '#F4A261',
    timeWindow: '1\u20134 \u0447',
    peakHours: '2\u20134 \u0447',
    description:
      'Интерлейкин-1 бета — мощный провоспалительный цитокин, активирующий эндотелий, увеличивающий васкулярную проницаемость и стимулирующий лимфоцитарный ответ.',
    clinicalSignificance: [
      'Активация эндотелия и вазодилатация',
      'Индуцирует лихорадку и поведение болезни',
      'Усиливает продукцию IL-6 и СРБ',
    ],
    thresholds: { normal: '< 50 pg/mL', elevated: '50\u2013100 pg/mL', critical: '> 100 pg/mL' },
    peakValue: 72,
    unit: 'pg/mL',
    type: 'Провоспалительный',
  },
  {
    id: 'il-6',
    name: 'IL-6',
    shortName: 'IL-6',
    color: '#E9C46A',
    timeWindow: '4\u201312 \u0447',
    peakHours: '4\u201312 \u0447',
    description:
      'Интерлейкин-6 — ключевой прогностический маркер при остром животе. Стимулирует синтез белков острой фазы (СРБ, прокальцитонин) и отражает величину воспалительного ответа.',
    clinicalSignificance: [
      'Ключевой прогностический маркер тяжести',
      'Коррелирует с риском осложнений',
      'Лучше прогностическая, чем диагностическая ценность',
    ],
    thresholds: { normal: '< 50 pg/mL', elevated: '50\u2013100 pg/mL', critical: '> 100 pg/mL' },
    peakValue: 95,
    unit: 'pg/mL',
    type: 'Провоспалительный',
  },
  {
    id: 'crp',
    name: 'CRP',
    shortName: 'CRP',
    color: '#FF6B6B',
    timeWindow: '12\u201324 \u0447',
    peakHours: '12\u201324 \u0447',
    description:
      'С-реактивный белок — белок острой фазы, синтезируемый печенью в ответ на IL-6. Появляется позже ранних цитокинов, но обеспечивает наилучшую чувствительность для мониторинга воспаления.',
    clinicalSignificance: [
      'Чувствительный индикатор воспаления',
      'Мониторинг эффективности терапии',
      'Постоянно высокий = неконтролируемое воспаление',
    ],
    thresholds: { normal: '< 10 mg/L', elevated: '10\u2013200 mg/L', critical: '> 200 mg/L' },
    peakValue: 78,
    unit: 'mg/L',
    type: 'Белок острой фазы',
  },
  {
    id: 'pct',
    name: 'PCT',
    shortName: 'PCT',
    color: '#F15BB5',
    timeWindow: '6\u201324 \u0447',
    peakHours: '6\u201324 \u0447',
    description:
      'Прокальцитонин — предшественник белка кальцитонина. Специфичен для бактериальной инфекции и сепсиса, что делает его ценным для дифференциации бактериального и небактериального воспаления.',
    clinicalSignificance: [
      'Специфичен для бактериальной инфекции',
      'Различает бактериальное и небактериальное',
      'Ранний предиктор сепсиса и ПОД',
    ],
    thresholds: { normal: '< 0.5 ng/mL', elevated: '0.5\u20132.0 ng/mL', critical: '> 2.0 ng/mL' },
    peakValue: 68,
    unit: 'ng/mL',
    type: 'Прокальцитонин',
  },
  {
    id: 'il-10',
    name: 'IL-10',
    shortName: 'IL-10',
    color: '#9B5DE5',
    timeWindow: '6\u201348 \u0447',
    peakHours: '6\u201348 \u0447',
    description:
      'Интерлейкин-10 — основной противовоспалительный цитокин. Подавляет иммунный ответ, но в избытке может привести к иммуносупрессии и вторичным инфекциям.',
    clinicalSignificance: [
      'Противовоспалительная регуляция',
      'Высокий уровень = риск иммуносупрессии',
      'Баланс про-/противовоспаления',
    ],
    thresholds: { normal: '< 25 pg/mL', elevated: '25\u201350 pg/mL', critical: '> 50 pg/mL' },
    peakValue: 55,
    unit: 'pg/mL',
    type: 'Противовоспалительный',
  },
];

const TABS = [
  { id: 'tiscpa', label: 'TISCPA \u043A\u0430\u0441\u043A\u0430\u0434' },
  { id: 'damps', label: 'DAMPs \u0438 TLR-4' },
  { id: 'barrier', label: '\u0411\u0430\u0440\u044C\u0435\u0440 \u043A\u0438\u0448\u0435\u0447\u043D\u0438\u043A\u0430' },
  { id: 'integration', label: '\u0418\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u044F' },
];

const PATHWAY_BLOCKS: PathwayBlock[] = [
  { id: 'tissue', label: 'Повреждение ткани', color: '#7B68EE', description: 'Травма, ишемия или некроз инициирует высвобождение DAMPs в межклеточное пространство.' },
  { id: 'damps', label: 'DAMPs (HMGB1)', color: '#9B5DE5', description: 'Молекулярные паттерны повреждения связываются с рецепторами TLR-4 на иммунных клетках, запуская внутриклеточную сигнализацию.' },
  { id: 'tlr4', label: 'Активация TLR-4', color: '#7B68EE', description: 'Рецептор TLR-4 активируется, запуская внутриклеточную сигнализацию через путь, зависимый от MyD88.' },
  { id: 'nfkb', label: 'Каскад NF-\u03BAB', color: '#4A90D9', description: 'Последовательная активация IRAK, TRAF6, TAK1, IKK приводит к транслокации NF-\u03BAB в ядро и транскрипции генов цитокинов.' },
  { id: 'cytokines', label: 'Цитокиновый шторм', color: '#E84545', description: 'Массивная продукция TNF-\u03B1, IL-1\u03B2, IL-6 и других создаёт синдром системного воспалительного ответа (СВР).' },
  { id: 'barrier', label: 'Дисфункция барьера', color: '#4ECDC4', description: 'Воспалительные цитокины нарушают плотные контакты (окклюдин, клаудин-1, ZO-1) в кишечном эпителии.' },
  { id: 'transloc', label: 'Транслокация', color: '#F4A261', description: 'Бактерии и ЛПС проникают через скомпрометированный барьер, усиливая воспаление и поддерживая цикл.' },
  { id: 'sepsis', label: 'Сепсис / ПОД', color: '#E84545', description: 'Неконтролируемое системное воспаление приводит к синдрому полиорганной дисфункции (ПОД) и септическому шоку.' },
];

const TABLE_DATA: TableMarker[] = [
  { name: 'TNF-\u03B1', type: 'Провоспалительный', peak: '0\u20132', threshold: '> 50 pg/mL', significance: 'Ранний индикатор', module: 'TISCPA', color: '#E84545' },
  { name: 'IL-1\u03B2', type: 'Провоспалительный', peak: '2\u20134', threshold: '> 100 pg/mL', significance: 'Активация эндотелия', module: 'TISCPA', color: '#F4A261' },
  { name: 'IL-6', type: 'Провоспалительный', peak: '4\u201312', threshold: '> 100 pg/mL', significance: 'Ключевой прогностический', module: 'TISCPA', color: '#E9C46A' },
  { name: 'CRP', type: 'Белок острой фазы', peak: '12\u201324', threshold: '> 200 mg/L', significance: 'Тяжесть воспаления', module: 'TISCPA', color: '#FF6B6B' },
  { name: 'PCT', type: 'Прокальцитонин', peak: '6\u201324', threshold: '> 2.0 ng/mL', significance: 'Бактериальная инфекция', module: 'TISCPA', color: '#F15BB5' },
  { name: 'IL-10', type: 'Противовоспалительный', peak: '6\u201348', threshold: '> 50 pg/mL', significance: 'Иммуносупрессия', module: 'TISCPA', color: '#9B5DE5' },
  { name: 'HMGB1', type: 'DAMP', peak: '24\u201348', threshold: '> 15 ng/mL', significance: 'Поздний медиатор', module: 'DAMPs', color: '#7B68EE' },
  { name: 'D-lactate', type: 'Метаболит', peak: '2\u20136', threshold: '> 3.0 mmol/L', significance: 'Ишемия кишечника', module: 'Barrier', color: '#F4A261' },
  { name: 'I-FABP', type: 'Белок энтероцита', peak: '1\u20133', threshold: '> 500 pg/mL', significance: 'Некроз энтероцитов', module: 'Barrier', color: '#E84545' },
];

const HMGB1_CHART_DATA = [
  { hour: 0, value: 2 },
  { hour: 6, value: 4 },
  { hour: 12, value: 7 },
  { hour: 18, value: 10 },
  { hour: 24, value: 14 },
  { hour: 30, value: 15 },
  { hour: 36, value: 14 },
  { hour: 42, value: 12 },
  { hour: 48, value: 10 },
  { hour: 54, value: 8 },
  { hour: 60, value: 7 },
  { hour: 66, value: 6 },
  { hour: 72, value: 5 },
];

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

/* ------------------------------------------------------------------ */
/*  Section wrapper - scroll-triggered fade in                         */
/* ------------------------------------------------------------------ */

function Section({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail Drawer                                                      */
/* ------------------------------------------------------------------ */

function CytokineDrawer({ node, onClose }: { node: CytokineNode; onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[60]"
        style={{ backgroundColor: 'rgba(11, 15, 20, 0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-[480px] border-l border-border-subtle bg-bg-elevated shadow-modal overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border-subtle p-6">
            <div
              className="h-10 w-10 rounded-full border-[3px]"
              style={{ borderColor: node.color, backgroundColor: `${node.color}20` }}
            />
            <div className="flex-1">
              <h3 className="font-heading text-xl font-semibold text-text-primary">
                {node.name}
              </h3>
              <p className="text-xs text-text-muted">{node.type}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors duration-150"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Description */}
            <div>
              <h4 className="text-label uppercase text-text-muted mb-2">Описание</h4>
              <p className="text-body-md text-text-secondary leading-relaxed">{node.description}</p>
            </div>

            {/* Time window */}
            <div>
              <h4 className="text-label uppercase text-text-muted mb-2">Временное окно</h4>
              <div className="rounded-lg bg-bg-tertiary border border-border-subtle p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Появление</span>
                  <span className="text-sm font-medium text-text-primary">{node.timeWindow}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Пик</span>
                  <span className="text-sm font-medium" style={{ color: node.color }}>
                    {node.peakHours}
                  </span>
                </div>
                {/* Mini bar */}
                <div className="mt-3 h-2 w-full rounded-full bg-bg-primary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${node.peakValue}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: node.color }}
                  />
                </div>
              </div>
            </div>

            {/* Clinical significance */}
            <div>
              <h4 className="text-label uppercase text-text-muted mb-2">
                Клиническое значение
              </h4>
              <ul className="space-y-2">
                {node.clinicalSignificance.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: node.color }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Thresholds */}
            <div>
              <h4 className="text-label uppercase text-text-muted mb-2">Пороговые значения</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md bg-bg-primary border border-border-subtle px-3 py-2">
                  <span className="text-sm text-text-secondary">Норма</span>
                  <span className="text-sm font-medium text-success-green">{node.thresholds.normal}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-bg-primary border border-alert-yellow/30 px-3 py-2">
                  <span className="text-sm text-text-secondary">Повышен</span>
                  <span className="text-sm font-medium text-alert-yellow">{node.thresholds.elevated}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-bg-primary border border-alert-red/30 px-3 py-2">
                  <span className="text-sm text-text-secondary">Критический</span>
                  <span className="text-sm font-medium text-alert-red">{node.thresholds.critical}</span>
                </div>
              </div>
            </div>

            {/* Related markers */}
            <div>
              <h4 className="text-label uppercase text-text-muted mb-2">
                Связанные маркеры
              </h4>
              <div className="flex flex-wrap gap-2">
                {CYTOKINES.filter((c) => c.id !== node.id).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {}}
                    className="rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150 hover:scale-105"
                    style={{
                      borderColor: c.color,
                      color: c.color,
                      backgroundColor: `${c.color}15`,
                    }}
                  >
                    {c.shortName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Recharts custom tooltip                                            */
/* ------------------------------------------------------------------ */

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border-subtle bg-bg-elevated px-3 py-2 shadow-card">
      <p className="text-xs text-text-muted">Час {label}</p>
      <p className="text-sm font-medium text-text-primary">{payload[0].value} ng/mL</p>
    </div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */

export default function Molecular() {
  const [activeTab, setActiveTab] = useState('tiscpa');
  const [selectedNode, setSelectedNode] = useState<CytokineNode | null>(null);
  const [cascadeStep, setCascadeStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [activeDamp, setActiveDamp] = useState<string | null>(null);
  const [hoveredBarrier, setHoveredBarrier] = useState(false);
  const [selectedPathwayBlock, setSelectedPathwayBlock] = useState<string | null>(null);
  const [pathwayZoom, setPathwayZoom] = useState(1);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* -- cascade playback -- */
  const startPlayback = useCallback(() => {
    if (cascadeStep >= CYTOKINES.length - 1) {
      setCascadeStep(-1);
      setHasPlayed(false);
    }
    setIsPlaying(true);
    setHasPlayed(true);
    let step = cascadeStep >= 0 ? cascadeStep : -1;
    playRef.current = setInterval(() => {
      step += 1;
      if (step >= CYTOKINES.length) {
        setIsPlaying(false);
        if (playRef.current) clearInterval(playRef.current);
        return;
      }
      setCascadeStep(step);
    }, 600);
  }, [cascadeStep]);

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    if (playRef.current) clearInterval(playRef.current);
  }, []);

  const resetPlayback = useCallback(() => {
    setIsPlaying(false);
    setCascadeStep(-1);
    setHasPlayed(false);
    if (playRef.current) clearInterval(playRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, []);

  /* -- tab scroll -- */
  const scrollToTab = (tabId: string) => {
    setActiveTab(tabId);
    const el = sectionRefs.current[tabId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* -- sort table -- */
  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  const sortedTable = [...TABLE_DATA].sort((a, b) => {
    if (!sortCol) return 0;
    const aVal = a[sortCol as keyof TableMarker];
    const bVal = b[sortCol as keyof TableMarker];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  /* -- derived -- */
  const dampNodes = ['HMGB1', 'LPS', 'HSP70'];
  const pathwayNodes = ['MyD88', 'IRAK', 'TRAF6', 'TAK1', 'IKK', 'NF-\u03BAB', 'Gene transcription'];

  return (
    <div className="min-h-[100dvh]">
      {/* ==================== SECTION 1: PAGE HEADER ==================== */}
      <Section className="px-4 pt-16 pb-8 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumb */}
          <motion.nav
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-4 flex items-center gap-2 text-sm text-text-muted"
          >
            <Link to="/" className="hover:text-teal-400 transition-colors duration-150">Главная</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="hover:text-teal-400 transition-colors duration-150 cursor-pointer">Модули</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-text-secondary">Молекулярный патогенез</span>
          </motion.nav>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-heading text-display-lg font-semibold text-text-primary mb-3"
          >
            Молекулярный патогенез острого живота
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-body-lg text-text-secondary max-w-[640px] mb-6"
          >
            Каскад TISCPA, DAMPs, сигнализация TLR-4 и дисфункция кишечного барьера
          </motion.p>

          {/* Module tabs */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-wrap gap-1"
          >
            {TABS.map((tab, i) => (
              <motion.button
                key={tab.id}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={4 + i * 0.5}
                onClick={() => scrollToTab(tab.id)}
                className="rounded-t-md px-4 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: activeTab === tab.id ? '#19202A' : 'transparent',
                  color: activeTab === tab.id ? '#E8ECF0' : '#94A3B8',
                  borderBottom: activeTab === tab.id ? '2px solid #4ECDC4' : '2px solid transparent',
                }}
              >
                {tab.label}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ==================== SECTION 2: TISCPA CASCADE ==================== */}
      <div ref={(el) => { sectionRefs.current['tiscpa'] = el; }}>
        <Section className="border-t border-border-subtle bg-bg-secondary px-4 py-10 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-[1200px]">
            {/* Section label & title */}
            <div className="mb-8">
              <span className="text-label uppercase text-teal-400 tracking-widest">Каскад TISCPA</span>
              <h2 className="font-heading text-display-md font-semibold text-text-primary mt-2 mb-3">
                Временная шкала цитокинового ответа
              </h2>
              <p className="text-body-md text-text-secondary max-w-[700px]">
                Последовательная активация про- и противовоспалительных медиаторов при остром животе. 
                Нажмите на маркер для деталей.
              </p>
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={isPlaying ? pausePlayback : startPlayback}
                className="flex items-center gap-2 rounded-lg bg-bg-tertiary border border-border-subtle px-4 py-2 text-sm font-medium text-text-primary hover:border-teal-400 hover:text-teal-400 transition-all duration-150"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Пауза' : hasPlayed && cascadeStep >= CYTOKINES.length - 1 ? 'Повтор' : 'Запустить каскад'}
              </button>
              {(hasPlayed || cascadeStep >= 0) && (
                <button
                  onClick={resetPlayback}
                  className="flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all duration-150"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Сброс
                </button>
              )}
            </div>

            {/* Timeline - desktop horizontal */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between gap-2">
                {CYTOKINES.map((node, i) => (
                  <div key={node.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      {/* Node circle */}
                      <motion.button
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: i * 0.15,
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedNode(node)}
                        className="relative flex h-12 w-12 items-center justify-center rounded-full border-[3px] transition-all duration-300"
                        style={{
                          borderColor: node.color,
                          backgroundColor:
                            cascadeStep >= i ? `${node.color}30` : 'transparent',
                          boxShadow:
                            cascadeStep >= i
                              ? `0 0 16px ${node.color}40`
                              : 'none',
                        }}
                      >
                        <span
                          className="text-xs font-bold font-mono-data"
                          style={{ color: cascadeStep >= i ? node.color : '#5E6E80' }}
                        >
                          {i + 1}
                        </span>
                      </motion.button>

                      {/* Label */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: cascadeStep >= i || !hasPlayed ? 1 : 0.4 }}
                        className="mt-3 text-center"
                      >
                        <p
                          className="font-heading text-heading-md font-semibold"
                          style={{ color: node.color }}
                        >
                          {node.name}
                        </p>
                        <p className="text-body-sm text-text-muted mt-1">{node.timeWindow}</p>
                        {/* Peak bar */}
                        <div className="mt-2 mx-auto h-1.5 w-16 rounded-full bg-bg-primary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: cascadeStep >= i ? `${node.peakValue}%` : 0,
                            }}
                            transition={{ duration: 0.4 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: node.color }}
                          />
                        </div>
                      </motion.div>
                    </div>

                    {/* Connector */}
                    {i < CYTOKINES.length - 1 && (
                      <div className="relative mx-2 mb-8 flex-1 h-1 rounded-full bg-bg-primary overflow-hidden">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX: cascadeStep > i ? 1 : 0,
                          }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                          className="absolute inset-y-0 left-0 origin-left"
                          style={{
                            width: '100%',
                            background: `linear-gradient(to right, ${node.color}, ${CYTOKINES[i + 1].color})`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline - mobile vertical */}
            <div className="md:hidden space-y-4">
              {CYTOKINES.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-4"
                >
                  <button
                    onClick={() => setSelectedNode(node)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px]"
                    style={{
                      borderColor: node.color,
                      backgroundColor: cascadeStep >= i ? `${node.color}30` : 'transparent',
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: node.color }}>
                      {i + 1}
                    </span>
                  </button>
                  <div className="flex-1">
                    <p className="font-heading text-base font-semibold" style={{ color: node.color }}>
                      {node.name}
                    </p>
                    <p className="text-xs text-text-muted">{node.timeWindow}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </motion.div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* ==================== SECTION 3: DAMPs & TLR-4 ==================== */}
      <div ref={(el) => { sectionRefs.current['damps'] = el; }}>
        <Section className="px-4 py-10 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[55%_45%]">
              {/* Left - Interactive signalling diagram */}
              <div>
                <span className="text-label uppercase text-purple-accent tracking-widest">DAMPs / TLR-4</span>
                <h2 className="font-heading text-display-md font-semibold text-text-primary mt-2 mb-3">
                  Сигнализация TLR-4
                </h2>
                <p className="text-body-md text-text-secondary mb-8">
                  Молекулярные паттерны, связанные с повреждением, активируют рецепторы TLR-4, запуская внутриклеточный каскад NF-\u03BAB.
                </p>

                {/* Interactive SVG diagram */}
                <div className="rounded-xl border border-border-subtle bg-bg-secondary p-6">
                  <svg viewBox="0 0 600 400" className="w-full h-auto">
                    {/* DAMP nodes (left) */}
                    {dampNodes.map((name, i) => {
                      const y = 60 + i * 110;
                      const isActive = activeDamp === name;
                      return (
                        <g key={name}>
                          <motion.rect
                            x={20}
                            y={y}
                            width={90}
                            height={50}
                            rx={10}
                            fill={isActive ? '#9B5DE530' : '#19202A'}
                            stroke={isActive ? '#9B5DE5' : '#25303D'}
                            strokeWidth={isActive ? 2 : 1}
                            className="cursor-pointer"
                            onClick={() => setActiveDamp(isActive ? null : name)}
                            whileHover={{ scale: 1.05 }}
                            style={{ transformOrigin: '65px center' }}
                          />
                          <text
                            x={65}
                            y={y + 30}
                            textAnchor="middle"
                            fill={isActive ? '#9B5DE5' : '#94A3B8'}
                            fontSize={12}
                            fontWeight={500}
                            className="pointer-events-none"
                          >
                            {name}
                          </text>
                          {/* Arrow to TLR4 */}
                          {isActive && (
                            <motion.line
                              x1={110}
                              y1={y + 25}
                              x2={210}
                              y2={200}
                              stroke="#9B5DE5"
                              strokeWidth={2}
                              strokeDasharray="6 3"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.5 }}
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* Central TLR-4 node */}
                    <motion.circle
                      cx={260}
                      cy={200}
                      r={40}
                      fill="#7B68EE20"
                      stroke="#7B68EE"
                      strokeWidth={3}
                      animate={{
                        boxShadow: activeDamp ? '0 0 20px #7B68EE40' : 'none',
                      }}
                      style={{
                        filter: activeDamp ? 'drop-shadow(0 0 12px rgba(123,104,238,0.4))' : 'none',
                      }}
                    />
                    <text x={260} y={196} textAnchor="middle" fill="#E8ECF0" fontSize={14} fontWeight={600}>
                      TLR-4
                    </text>
                    <text x={260} y={212} textAnchor="middle" fill="#94A3B8" fontSize={10}>
                      /MD-2
                    </text>

                    {/* Pathway nodes (right) */}
                    {pathwayNodes.map((name, i) => {
                      const x = 350 + i * 30;
                      const y = 200;
                      return (
                        <g key={name}>
                          {/* Arrow */}
                          {i === 0 ? (
                            <line x1={300} y1={200} x2={340} y2={200} stroke="#25303D" strokeWidth={2} markerEnd="url(#arrowhead)" />
                          ) : (
                            <line
                              x1={350 + (i - 1) * 30}
                              y1={200}
                              x2={340 + i * 30}
                              y2={200}
                              stroke="#25303D"
                              strokeWidth={1.5}
                            />
                          )}
                          <motion.rect
                            x={x}
                            y={y - 20}
                            width={26}
                            height={40}
                            rx={6}
                            fill={activeDamp ? '#4A90D920' : '#19202A'}
                            stroke={activeDamp ? '#4A90D9' : '#25303D'}
                            strokeWidth={1}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.08 }}
                          />
                          <text
                            x={x + 13}
                            y={y + 4}
                            textAnchor="middle"
                            fill={activeDamp ? '#7DDED6' : '#5E6E80'}
                            fontSize={8}
                            className="pointer-events-none"
                          >
                            {name.length > 6 ? name.substring(0, 5) : name}
                          </text>
                        </g>
                      );
                    })}

                    {/* Arrow marker definition */}
                    <defs>
                      <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#25303D" />
                      </marker>
                    </defs>
                  </svg>

                  <p className="text-xs text-text-muted text-center mt-2">
                    Нажмите на узел DAMP (HMGB1, LPS, HSP70) для просмотра сигнального пути
                  </p>
                </div>
              </div>

              {/* Right - HMGB1 deep dive card */}
              <div>
                <div className="rounded-lg border-l-[3px] border-info-blue bg-bg-secondary p-6 shadow-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-info-blue" />
                    <h3 className="font-heading text-heading-lg font-semibold text-text-primary">
                      HMGB1 — универсальный DAMP
                    </h3>
                  </div>

                  <div className="space-y-5">
                    {/* Role */}
                    <div>
                      <h4 className="text-label uppercase text-text-muted mb-1">РОЛЬ</h4>
                      <p className="text-body-md text-text-secondary leading-relaxed">
                        HMGB1 — ядерный белок, высвобождаемый при некрозе и активируемый макрофагами. 
                        Ключевой поздний медиатор воспаления.
                      </p>
                    </div>

                    {/* Dynamics chart */}
                    <div>
                      <h4 className="text-label uppercase text-text-muted mb-2">ДИНАМИКА (0-72Ч)</h4>
                      <div className="h-[160px] w-full rounded-lg bg-bg-primary border border-border-subtle p-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={HMGB1_CHART_DATA}>
                            <defs>
                              <linearGradient id="hmgb1Grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#9B5DE5" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#9B5DE5" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#25303D" />
                            <XAxis dataKey="hour" tick={{ fill: '#5E6E80', fontSize: 10 }} axisLine={{ stroke: '#25303D' }} />
                            <YAxis tick={{ fill: '#5E6E80', fontSize: 10 }} axisLine={{ stroke: '#25303D' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#9B5DE5"
                              strokeWidth={2}
                              fill="url(#hmgb1Grad)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Thresholds */}
                    <div>
                      <h4 className="text-label uppercase text-text-muted mb-2">ПОРОГОВЫЕ ЗНАЧЕНИЯ</h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between rounded bg-bg-primary border border-border-subtle px-3 py-1.5">
                          <span className="text-sm text-text-secondary">Норма</span>
                          <span className="text-sm font-medium text-success-green">&lt; 5 ng/mL</span>
                        </div>
                        <div className="flex items-center justify-between rounded bg-bg-primary border border-alert-yellow/30 px-3 py-1.5">
                          <span className="text-sm text-text-secondary">Повышен</span>
                          <span className="text-sm font-medium text-alert-yellow">5-15 ng/mL</span>
                        </div>
                        <div className="flex items-center justify-between rounded bg-bg-primary border border-alert-red/30 px-3 py-1.5">
                          <span className="text-sm text-text-secondary">Критический</span>
                          <span className="text-sm font-medium text-alert-red">&gt; 15 ng/mL</span>
                        </div>
                      </div>
                    </div>

                    {/* Clinical link */}
                    <div className="rounded-md bg-purple-accent/10 border border-purple-accent/20 px-3 py-2.5">
                      <p className="text-sm text-text-secondary">
                        <span className="text-purple-accent font-medium">Клиническая корреляция: </span>
                        Уровень HMGB1 коррелирует с тяжестью перитонита и риском полиорганной дисфункции.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* ==================== SECTION 4: INTESTINAL BARRIER ==================== */}
      <div ref={(el) => { sectionRefs.current['barrier'] = el; }}>
        <Section className="border-t border-border-subtle bg-bg-secondary px-4 py-10 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-[1200px]">
            {/* Section label & title */}
            <div className="mb-8">
              <span className="text-label uppercase text-teal-400 tracking-widest">Кишечный барьер</span>
              <h2 className="font-heading text-display-md font-semibold text-text-primary mt-2 mb-3">
                Дисфункция кишечного барьера
              </h2>
              <p className="text-body-md text-text-secondary max-w-[700px]">
                Нарушение плотных контактов, усиление транслокации бактерий и эндотоксинов — ключевой патогенетический механизм.
              </p>
            </div>

            {/* Three card grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
            >
              {/* Card 1: Barrier structure */}
              <motion.div
                variants={staggerItem}
                className="rounded-lg border-l-[3px] border-info-blue bg-bg-secondary p-6 shadow-card"
              >
                <h3 className="font-heading text-heading-md font-semibold text-text-primary mb-4">
                  Структура барьера
                </h3>

                {/* Interactive SVG - intestinal barrier */}
                <div
                  className="mb-4 rounded-lg bg-bg-primary border border-border-subtle p-3 cursor-pointer"
                  onMouseEnter={() => setHoveredBarrier(true)}
                  onMouseLeave={() => setHoveredBarrier(false)}
                >
                  <svg viewBox="0 0 280 140" className="w-full h-auto">
                    {/* Epithelial cells */}
                    {[0, 1, 2, 3].map((i) => (
                      <g key={i}>
                        {/* Cell body */}
                        <rect
                          x={20 + i * 65}
                          y={40}
                          width={60}
                          height={60}
                          rx={4}
                          fill="#19202A"
                          stroke="#25303D"
                          strokeWidth={1}
                        />
                        {/* Microvilli */}
                        {[0, 1, 2, 3, 4].map((j) => (
                          <line
                            key={j}
                            x1={25 + i * 65 + j * 10}
                            y1={40}
                            x2={25 + i * 65 + j * 10}
                            y2={28}
                            stroke="#4ECDC4"
                            strokeWidth={1.5}
                            opacity={0.5}
                          />
                        ))}
                        {/* Tight junction */}
                        {i < 3 && (
                          <motion.line
                            x1={80 + i * 65}
                            y1={50}
                            x2={20 + (i + 1) * 65}
                            y2={50}
                            stroke={hoveredBarrier ? '#E84545' : '#4ECDC4'}
                            strokeWidth={2}
                            animate={{
                              strokeDasharray: hoveredBarrier ? '4 6' : 'none',
                              opacity: hoveredBarrier ? 0.4 : 1,
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        {/* Label */}
                        <text x={50 + i * 65} y={75} textAnchor="middle" fill="#94A3B8" fontSize={8}>
                          E
                        </text>
                      </g>
                    ))}

                    {/* Lamina propria label */}
                    <text x={140} y={125} textAnchor="middle" fill="#5E6E80" fontSize={9}>
                      Собственная пластинка
                    </text>
                    <line x1={20} y1={110} x2={260} y2={110} stroke="#25303D" strokeWidth={1} />

                    {/* Tight junction label */}
                    <motion.text
                      x={140}
                      y={18}
                      textAnchor="middle"
                      fill={hoveredBarrier ? '#E84545' : '#4ECDC4'}
                      fontSize={9}
                      animate={{ opacity: 1 }}
                    >
                      {hoveredBarrier ? 'ПК нарушены!' : 'Плотные контакты сохранены'}
                    </motion.text>
                  </svg>
                </div>

                <p className="text-body-md text-text-secondary leading-relaxed">
                  Плотные контакты (окклюдин, клаудин-1, ZO-1) формируют первый физический барьер. 
                  При ишемии и воспалении происходит их дисрегуляция.
                </p>
                <p className="text-body-sm text-teal-400 mt-2">
                  Наведите на диаграмму для просмотра нарушения барьера
                </p>
              </motion.div>

              {/* Card 2: Translocation */}
              <motion.div
                variants={staggerItem}
                className="rounded-lg border-l-[3px] border-alert-orange bg-bg-secondary p-6 shadow-card"
              >
                <h3 className="font-heading text-heading-md font-semibold text-text-primary mb-4">
                  Транслокация
                </h3>

                {/* Arrow diagram */}
                <div className="mb-4 rounded-lg bg-bg-primary border border-border-subtle p-3">
                  <div className="flex flex-col items-center gap-2">
                    {['Просвет кишечника', 'Нарушение ПК', 'Лейкоциты + бактерии', 'Системное воспаление'].map(
                      (label, i) => (
                        <div key={label} className="flex items-center gap-2 w-full">
                          <div
                            className="flex-1 rounded-md px-2 py-1.5 text-center text-xs font-medium"
                            style={{
                              backgroundColor:
                                i === 0
                                  ? '#4ECDC415'
                                  : i === 1
                                  ? '#F4A26115'
                                  : i === 2
                                  ? '#E8454515'
                                  : '#E8454520',
                              color:
                                i === 0
                                  ? '#4ECDC4'
                                  : i === 1
                                  ? '#F4A261'
                                  : '#E84545',
                              border: `1px solid ${
                                i === 0
                                  ? '#4ECDC430'
                                  : i === 1
                                  ? '#F4A26130'
                                  : '#E8454530'
                              }`,
                            }}
                          >
                            {label}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  {/* Arrows between */}
                  <div className="flex flex-col items-center -mt-1 -mb-1 relative z-10">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-3 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-alert-orange" />
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-body-md text-text-secondary leading-relaxed">
                  Транслокация бактерий и эндотоксинов через повреждённый барьер усиливает 
                  системный воспалительный ответ и провоцирует сепсис.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-alert-orange" />
                  <p className="text-data-md text-alert-orange font-medium">
                    При тяжёлом ОЖ транслокация достигает 40-60%
                  </p>
                </div>
              </motion.div>

              {/* Card 3: Barrier biomarkers */}
              <motion.div
                variants={staggerItem}
                className="rounded-lg border-l-[3px] border-info-blue bg-bg-secondary p-6 shadow-card"
              >
                <h3 className="font-heading text-heading-md font-semibold text-text-primary mb-4">
                  Биомаркеры барьера
                </h3>

                <div className="space-y-2">
                  {[
                    { name: 'D-lactate', value: '> 3.0 mmol/L', status: 'critical' },
                    { name: 'I-FABP', value: '> 500 pg/mL', status: 'critical' },
                    { name: 'Citrulline', value: '< 10 \u00B5mol/L', status: 'warning' },
                    { name: 'Zonulin', value: '> 50 ng/mL', status: 'elevated' },
                  ].map((bm, i) => (
                    <motion.div
                      key={bm.name}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="flex items-center justify-between rounded-md bg-bg-primary border border-border-subtle px-3 py-2.5 hover:bg-bg-tertiary transition-colors duration-150 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              bm.status === 'critical'
                                ? '#E84545'
                                : bm.status === 'warning'
                                ? '#E9C46A'
                                : '#F4A261',
                          }}
                        />
                        <span className="text-sm text-text-primary font-medium">{bm.name}</span>
                      </div>
                      <span className="text-sm font-mono-data text-text-secondary">{bm.value}</span>
                    </motion.div>
                  ))}
                </div>

                <p className="text-body-sm text-text-muted mt-4">
                  Нажмите на строку для деталей биомаркера в Модуле Б
                </p>
              </motion.div>
            </motion.div>
          </div>
        </Section>
      </div>

      {/* ==================== SECTION 5: INTEGRATED PATHWAY ==================== */}
      <div ref={(el) => { sectionRefs.current['integration'] = el; }}>
        <Section className="px-4 py-10 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-[1200px]">
            {/* Section label & title */}
            <div className="mb-8">
              <span className="text-label uppercase text-teal-400 tracking-widest">Интеграция</span>
              <h2 className="font-heading text-display-md font-semibold text-text-primary mt-2 mb-3">
                Полная патогенетическая схема
              </h2>
              <p className="text-body-md text-text-secondary max-w-[700px]">
                Интегрированное представление всех молекулярных механизмов, связывающих повреждение тканей с системным воспалительным ответом.
              </p>
            </div>

            {/* Flowchart */}
            <div className="rounded-xl border border-border-subtle bg-bg-secondary p-6 overflow-x-auto">
              <div
                className="min-w-[900px]"
                style={{ transform: `scale(${pathwayZoom})`, transformOrigin: 'top left' }}
              >
                {/* Flow blocks */}
                <div className="flex items-center gap-3">
                  {PATHWAY_BLOCKS.map((block, i) => (
                    <div key={block.id} className="flex items-center gap-3">
                      <motion.button
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setSelectedPathwayBlock(
                            selectedPathwayBlock === block.id ? null : block.id
                          )
                        }
                        className="relative rounded-lg px-4 py-3 text-center transition-all duration-200 min-w-[100px]"
                        style={{
                          backgroundColor:
                            selectedPathwayBlock === block.id
                              ? `${block.color}30`
                              : '#19202A',
                          border: `1px solid ${
                            selectedPathwayBlock === block.id ? block.color : '#25303D'
                          }`,
                          boxShadow:
                            selectedPathwayBlock === block.id
                              ? `0 0 16px ${block.color}30`
                              : 'none',
                          opacity:
                            selectedPathwayBlock && selectedPathwayBlock !== block.id
                              ? 0.4
                              : 1,
                        }}
                      >
                        <p
                          className="font-heading text-sm font-semibold"
                          style={{
                            color:
                              selectedPathwayBlock === block.id ? '#E8ECF0' : block.color,
                          }}
                        >
                          {block.label}
                        </p>
                      </motion.button>

                      {/* Arrow */}
                      {i < PATHWAY_BLOCKS.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 + 0.05 }}
                          className="flex items-center"
                        >
                          <ArrowRight
                            className="h-4 w-4 shrink-0"
                            style={{ color: block.color }}
                          />
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Info tooltip for selected block */}
                <AnimatePresence>
                  {selectedPathwayBlock && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: 8, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div
                        className="rounded-lg border px-4 py-3"
                        style={{
                          borderColor: `${PATHWAY_BLOCKS.find((b) => b.id === selectedPathwayBlock)?.color}40`,
                          backgroundColor: `${PATHWAY_BLOCKS.find((b) => b.id === selectedPathwayBlock)?.color}10`,
                        }}
                      >
                        <p className="text-sm text-text-secondary">
                          {PATHWAY_BLOCKS.find((b) => b.id === selectedPathwayBlock)?.description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={() => setPathwayZoom((z) => Math.min(z + 0.1, 1.5))}
                  className="rounded-lg border border-border-subtle p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors duration-150"
                  title="Увеличить"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPathwayZoom((z) => Math.max(z - 0.1, 0.6))}
                  className="rounded-lg border border-border-subtle p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors duration-150"
                  title="Уменьшить"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPathwayZoom(1)}
                  className="rounded-lg border border-border-subtle p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors duration-150"
                  title="Сбросить масштаб"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <span className="text-xs text-text-muted ml-1">{Math.round(pathwayZoom * 100)}%</span>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 border-t border-border-subtle pt-4">
                <span className="text-xs text-text-muted">Легенда:</span>
                {[
                  { label: 'DAMPs', color: '#9B5DE5' },
                  { label: 'TLR-4', color: '#7B68EE' },
                  { label: 'Cytokines', color: '#E84545' },
                  { label: 'Barrier', color: '#4ECDC4' },
                  { label: 'Sepsis', color: '#E84545' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-text-secondary">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* ==================== SECTION 6: QUICK REFERENCE TABLE ==================== */}
      <Section className="border-t border-border-subtle bg-bg-secondary px-4 py-10 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="font-heading text-heading-lg font-semibold text-text-primary mb-6">
            Сравнительная таблица молекулярных маркеров
          </h2>

          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full">
              {/* Header */}
              <thead>
                <tr className="bg-bg-tertiary">
                  {[
                    { key: 'name', label: 'МАРКЕР' },
                    { key: 'type', label: 'ТИП' },
                    { key: 'peak', label: 'ПИК (ЧАСЫ)' },
                    { key: 'threshold', label: 'КРИТИЧЕСКИЙ ПОРОГ' },
                    { key: 'significance', label: 'КЛИНИЧЕСКОЕ ЗНАЧЕНИЕ' },
                    { key: 'module', label: 'МОДУЛЬ' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="cursor-pointer select-none px-4 py-3 text-left text-label uppercase text-text-muted tracking-wider hover:text-text-primary transition-colors duration-150"
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        <ArrowUpDown
                          className="h-3 w-3"
                          style={{
                            color: sortCol === col.key ? '#4ECDC4' : undefined,
                          }}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {sortedTable.map((row, i) => (
                  <motion.tr
                    key={row.name}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.04,
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    }}
                    className="border-b border-border-subtle bg-bg-secondary hover:bg-bg-tertiary transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <span
                        className="font-heading text-sm font-semibold"
                        style={{ color: row.color }}
                      >
                        {row.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{row.type}</td>
                    <td className="px-4 py-3 text-sm font-mono-data text-text-primary">{row.peak}</td>
                    <td className="px-4 py-3 text-sm font-mono-data text-alert-red">{row.threshold}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{row.significance}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor:
                            row.module === 'TISCPA'
                              ? '#E8454515'
                              : row.module === 'DAMPs'
                              ? '#9B5DE515'
                              : '#4ECDC415',
                          color:
                            row.module === 'TISCPA'
                              ? '#E84545'
                              : row.module === 'DAMPs'
                              ? '#9B5DE5'
                              : '#4ECDC4',
                        }}
                      >
                        {row.module}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ==================== DRAWER OVERLAY ==================== */}
      <AnimatePresence>
        {selectedNode && (
          <CytokineDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
