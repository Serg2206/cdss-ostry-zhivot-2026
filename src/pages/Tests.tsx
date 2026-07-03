import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Target,
  Star,
  GripVertical,
  Info,
  Check,
  X,
  ChevronRight,
  RotateCcw,
  ArrowRight,
  AlertTriangle,
  Brain,
  Clock,
  Activity,
  Lightbulb,
  Printer,
  Home,
} from 'lucide-react';
import { Link } from 'react-router';

// ─── Types ───────────────────────────────────────────────────────────

type CytokineKey = 'TNF-α' | 'IL-1β' | 'IL-6' | 'CRP' | 'PCT' | 'IL-10';

interface CytokineData {
  key: CytokineKey;
  color: string;
  peakTime: string;
  explanation: string;
}

interface BiomarkerValue {
  name: string;
  value: string;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
}

interface BiomarkerCase {
  id: number;
  vignette: string;
  biomarkers: BiomarkerValue[];
  options: string[];
  correctIndex: number;
  explanation: string;
  keyMarkers: string[];
  moduleLink: string;
}

interface CognitiveScenario {
  id: number;
  trapLabel: string;
  trapColor: string;
  scenario: string;
  hint: string;
  options: string[];
  correctIndex: number;
  trapExplanation: string;
  lesson: string;
}

// ─── Data ────────────────────────────────────────────────────────────

const CYTOKINES: CytokineData[] = [
  { key: 'TNF-α', color: '#E84545', peakTime: '90 мин (0–2 ч)', explanation: 'Самый ранний медиатор — запускает каскад воспаления' },
  { key: 'IL-1β', color: '#F4A261', peakTime: '2 ч', explanation: 'Ранний проксимальный цитокин, усиливает TNF-α' },
  { key: 'IL-6', color: '#E9C46A', peakTime: '4–6 ч', explanation: 'Основной индуктор синтеза фазовых белков печени' },
  { key: 'IL-10', color: '#9B5DE5', peakTime: '3 ч (пик 6–48 ч)', explanation: 'Ключевой противовоспалительный цитокин' },
  { key: 'PCT', color: '#F15BB5', peakTime: '6–24 ч', explanation: 'Маркер бактериальной инфекции, перекрывается с CRP' },
  { key: 'CRP', color: '#FF6B6B', peakTime: '24–36 ч', explanation: 'Поздний острофазовый белок, пик через 12–24 ч' },
];

const CORRECT_ORDER: CytokineKey[] = ['TNF-α', 'IL-1β', 'IL-6', 'IL-10', 'PCT', 'CRP'];

const BIOMARKER_CASES: BiomarkerCase[] = [
  {
    id: 1,
    vignette: 'Пациент 72 года, в анамнезе — фибрилляция предсердий. Внезапно возникшая сильная боль в животе, кишечные стул 2 раза с примесью крови. Живот мягкий, но болезненный.',
    biomarkers: [
      { name: 'I-FABP', value: '850 pg/mL', severity: 'severe' },
      { name: 'D-лактат', value: '5.2 mmol/L', severity: 'severe' },
      { name: 'Лактат', value: '4.1 mmol/L', severity: 'severe' },
      { name: 'PCT', value: '0.8 ng/mL', severity: 'moderate' },
      { name: 'CRP', value: '45 mg/L', severity: 'moderate' },
    ],
    options: [
      'Острый панкреатит (легкий)',
      'Мезентериальная ишемия',
      'Инфицированный панкреонекроз',
      'Острый аппендицит',
    ],
    correctIndex: 1,
    explanation: 'I-FABP > 600 + D-лактат > 0.5 — высокоспецифичная комбинация для мезентериальной ишемии. D-лактат > 3.0 указывает на ишемию кишечника. Лактат > 2.5 подтверждает тканевую гипоксию.',
    keyMarkers: ['I-FABP > 600 = повреждение энтероцитов', 'D-лактат > 0.5 = ишемия кишечника', 'Относительно низкий PCT исключает инфицированный панкреонекроз'],
    moduleLink: '/biomarkers',
  },
  {
    id: 2,
    vignette: 'Пациент 58 лет, обильное употребление алкоголя. Острая боль в эпигастрии, иррадиирующая в спину, тошнота, многократная рвота. В анамнезе — 2 эпизода панкреатита.',
    biomarkers: [
      { name: 'PLA2-II', value: '450 ng/mL', severity: 'severe' },
      { name: 'Липаза', value: '2800 U/L', severity: 'severe' },
      { name: 'PCT', value: '6.2 ng/mL', severity: 'severe' },
      { name: 'CRP', value: '220 mg/L', severity: 'severe' },
      { name: 'Лактат', value: '3.8 mmol/L', severity: 'severe' },
      { name: 'Глюкоза', value: '9.2 mmol/L', severity: 'mild' },
    ],
    options: [
      'Острый панкреатит (легкий)',
      'Мезентериальная ишемия',
      'Инфицированный панкреонекроз',
      'Перфорация язвы желудка',
    ],
    correctIndex: 2,
    explanation: 'PLA2-II > 300 + липаза > 1000 + PCT > 2.0 — классическая триада панкреонекроза с бактериальным инфицированием. CRP > 100 и лактат > 3 указывают на тяжелое течение с тканевой гипоксией. Легкий панкреатит исключается по PCT и липазе.',
    keyMarkers: ['PLA2-II > 300 = панкреонекроз', 'Липаза > 1000 = тяжелый панкреатит', 'PCT > 2.0 = бактериальное инфицирование'],
    moduleLink: '/biomarkers',
  },
  {
    id: 3,
    vignette: 'Пациент 65 лет, перенесенный перитонит после перфорации язвы. Проведена операция. На 5-е сутки — температура 38.5°C, но гемодинамика стабильная.',
    biomarkers: [
      { name: 'HLA-DR', value: '3200 MFI', severity: 'severe' },
      { name: 'IL-10', value: '285 pg/mL', severity: 'severe' },
      { name: 'IL-6', value: '180 pg/mL', severity: 'moderate' },
      { name: 'TNF-α', value: '15 pg/mL', severity: 'normal' },
      { name: 'PCT', value: '1.2 ng/mL', severity: 'moderate' },
    ],
    options: [
      'Рецидив перитонита — реоперация',
      'Иммунопаралич / CARS (компенсаторное противовоспалительное реагирование)',
      'Бактериемия с грам-отрицательными микроорганизмами',
      'Нормальное восстановление после операции',
    ],
    correctIndex: 1,
    explanation: 'HLA-DR < 8000 + высокий IL-10 = иммунопаралич (CARS). Пациент не может адекватно реагировать на инфекцию. TNF-α нормальный — это НЕ SIRS. PCT умеренно повышен, но не критически. Требуется иммуномодуляция, а не хирургия.',
    keyMarkers: ['HLA-DR < 8000 = иммунодепрессия', 'Высокий IL-10 = CARS (противовоспалительный ответ)', 'Низкий TNF-α = отсутствие SIRS'],
    moduleLink: '/molecular',
  },
  {
    id: 4,
    vignette: 'Пациент 34 года, острая боль в правом нижнем квадранте живота, лихорадка 37.8°C, боль усиливается при движении. Аппетит сохранен.',
    biomarkers: [
      { name: 'PCT', value: '0.2 ng/mL', severity: 'normal' },
      { name: 'CRP', value: '35 mg/L', severity: 'moderate' },
      { name: 'Лейкоциты', value: '11.2 × 10⁹/L', severity: 'mild' },
      { name: 'Лактат', value: '1.4 mmol/L', severity: 'normal' },
    ],
    options: [
      'Острый аппендицит — срочная аппендэктомия',
      'Вирусная/небактериальная этиология (аденовирусный мезаденит)',
      'Перфорация язвы с абсцессом',
      'Тубовариальное образование с осложнениями',
    ],
    correctIndex: 1,
    explanation: 'PCT < 0.5 при умеренном CRP указывает на вирусную или небактериальную этиологию. При остром бактериальном аппендиците PCT обычно > 0.5. Лактат нормальный — нет тканевой гипоксии. Нормальный PCT при наличии воспаления — ключевой дифференциальный маркер.',
    keyMarkers: ['PCT < 0.5 = нет значимой бактериальной инфекции', 'CRP умеренный = воспаление присутствует, но не бактериальное', 'Нормальный лактат = нет ишемии'],
    moduleLink: '/diagnostics',
  },
  {
    id: 5,
    vignette: 'Пациент 55 лет, острая боль в животе, иррадиирующая в спину. В анамнезе — ишемическая болезнь сердца, стентирование год назад.',
    biomarkers: [
      { name: 'Моноолеин', value: '32 μmol/L', severity: 'severe' },
      { name: 'Глутамин', value: '280 μmol/L', severity: 'severe' },
      { name: 'Триптофан', value: '12 μmol/L', severity: 'severe' },
      { name: 'I-FABP', value: '120 pg/mL', severity: 'normal' },
      { name: 'D-лактат', value: '0.1 mmol/L', severity: 'normal' },
    ],
    options: [
      'Ранний острый инфаркт миокарда (с абдоминальной маской)',
      'Мезентериальная ишемия',
      'Острый панкреатит',
      'Расслаивающая аневризма аорты',
    ],
    correctIndex: 0,
    explanation: 'Моноолеин повышен + глутамин снижен + триптофан снижен = характерный метаболомный профиль раннего ОИМ. I-FABP и D-лактат в норме исключают мезентериальную ишемию. Это абдоминальная маска инфаркта миокарда — важнейший дифференциальный диагноз.',
    keyMarkers: ['Моноолеин ↑ + глутамин ↓ = ОИМ', 'Нормальный I-FABP и D-лактат = нет мезентериальной ишемии', 'Метаболомный профиль важнее стандартных маркеров'],
    moduleLink: '/biomarkers',
  },
];

const COGNITIVE_SCENARIOS: CognitiveScenario[] = [
  {
    id: 1,
    trapLabel: 'Ошибка привязки (Anchoring Bias)',
    trapColor: '#E84545',
    scenario: 'Пациент 34 года, типичная картина острого аппендицита: боль в правой подвздошной области, тошнота, лихорадка 38.2°C. Хирург направляет в операционную для срочной аппендэктомии.',
    hint: 'В анамнезе у пациента — серповидно-клеточная анемия (СКА). ПЦТ был нормальным при поступлении.',
    options: [
      'Срочная аппендэктомия — классическая клиника',
      'Исключить СКА-криз (анамнез!) + ПЦТ перед операцией',
      'КТ брюшной полости для уточнения диагноза',
      'Консультация гематолога — отложить решение',
    ],
    correctIndex: 1,
    trapExplanation: 'Привязка к диагнозу «аппендицит» по типичной картине заставляет игнорировать важнейший анамнез — СКА. При СКА вазоокклюзивный криз может имитировать любой острый живот.',
    lesson: 'При известной СКА в анамнезе: ПЦТ нормальный → скорее вазоокклюзивный криз. ПЦТ ↑↑ → Salmonella sepsis! Всегда проверяйте ПЦТ перед хирургическим вмешательством при СКА.',
  },
  {
    id: 2,
    trapLabel: 'Преждевременное закрытие (Premature Closure)',
    trapColor: '#F4A261',
    scenario: 'Пациент 67 лет, острая боль в левом нижнем квадранте, лихорадка 38.5°C. КТ — утолщение сигмовидной кишки, жировое инфильтрация — «ясный» дивертикулит. Хирург решает ограничиться консервативной терапией.',
    hint: 'У пациента сахарный диабет типа 2. Глюкоза крови 22 mmol/L, кетоновые тела в моче 4.5 mmol/L, pH 7.15.',
    options: [
      'Направить в операционную — перитонит на фоне дивертикулита',
      'Глюкоза + кетоны → анионный промежуток → ДКА исключён ПЕРЕД хирургией',
      'Продолжить консервативное лечение дивертикулита',
      'Экстренная лапароскопия — «не ясный живот» у диабетика',
    ],
    correctIndex: 1,
    trapExplanation: 'Диагноз «дивертикулит» преждевременно закрыл диагностический поиск. ДКА — самая частая эндокринная маска острого живота. PCT нормальный + кетоны ↑↑ = ДКА, не перитонит.',
    lesson: 'ДКА может вызывать абдоминальную боль без истинного перитонита. Всегда исключайте ДКА перед хирургическим вмешательством у диабетиков — PCT и кетоновые тела ключевые маркеры.',
  },
  {
    id: 3,
    trapLabel: 'Эффект доступности (Availability Bias)',
    trapColor: '#E9C46A',
    scenario: 'Пациент 52 года, внезапная «кинжальная» боль в эпигастрии. Говорит: «Так же болело при прошлом панкреатите». Амилаза 340 U/L, липаза 580 U/L — умеренно повышены.',
    hint: '«Кинжальная» боль — классическое описание не для панкреатита. Пульс 110, АД 170/95 (обычно 130/80).',
    options: [
      'Панкреатит — консервативное лечение, как в прошлый раз',
      'КТ-ангиография аорты — разрыв / диссекция должны быть исключены',
      'ОИМ с абдоминальной маской — ЭКГ и тропонины',
      'Перфорация язвы — срочная операция',
    ],
    correctIndex: 1,
    trapExplanation: 'Недавний запомнившийся случай панкреатита (доступность) смещает диагностику. Амилза и липаза лишь умеренно повышены — не типично для острого панкреатита. «Кинжальная» боль = диссекция аорты до доказательства обратного.',
    lesson: '«Кинжальная» боль = диссекция аорты до доказательства обратного. Анамнез не отменяет протокол. КТ-ангиография — золотой стандарт для исключения диссекции.',
  },
  {
    id: 4,
    trapLabel: 'Эффект мнимого благополучия',
    trapColor: '#9B5DE5',
    scenario: 'Пациент 78 лет, легкая боль в животе, «выглядит хорошо», жизненные показатели на границе нормы (ЧСС 98, АД 135/85). Живот мягкий, без напряжения мышц. Резидент предлагает наблюдение в отделении.',
    hint: 'qSOFA = 2 (ЧСС ≥ 22 в минуту — нет, но дыхание 22/мин, систол АД ≤ 100 — нет, altered mental status — легкая спутанность). Лактат 2.8 mmol/L.',
    options: [
      'Наблюдение в отделении — пациент стабилен',
      'qSOFA + лактат → при любом подозрении: КТ брюшной полости',
      'Назначить обезболивание и повторную оценку через 4 часа',
      'Лабораторная панель — ждать результаты',
    ],
    correctIndex: 1,
    trapExplanation: 'У пожилых отсутствие классических признаков острого живота НЕ исключает перитонит. «Хороший» внешний вид при qSOFA ≥ 2 и лактате > 2.5 — опасное заблуждение. qSOFA предназначена именно для таких «скрытых» случаев.',
    lesson: 'У пожилых: отсутствие напряжения брюшной стенки НЕ исключает перитонит. qSOFA ≥ 2 = сепсис до доказательства обратного. Лактат > 2.5 требует активных действий, а не наблюдения.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────

function severityColor(s: string): string {
  switch (s) {
    case 'normal': return '#2A9D8F';
    case 'mild': return '#E9C46A';
    case 'moderate': return '#F4A261';
    case 'severe': return '#E84545';
    default: return '#94A3B8';
  }
}

function severityBg(s: string): string {
  switch (s) {
    case 'normal': return 'rgba(42,157,143,0.12)';
    case 'mild': return 'rgba(233,196,106,0.12)';
    case 'moderate': return 'rgba(244,162,97,0.12)';
    case 'severe': return 'rgba(232,69,69,0.12)';
    default: return 'rgba(37,48,61,0.5)';
  }
}

function getScoreColor(pct: number): string {
  if (pct >= 80) return '#2A9D8F';
  if (pct >= 50) return '#F4A261';
  return '#E84545';
}

function getScoreMessage(pct: number): { text: string; color: string; icon: typeof Trophy } {
  if (pct >= 80) return { text: 'Отличный результат! Вы хорошо ориентируетесь в патобиохимии острого живота.', color: '#2A9D8F', icon: Trophy };
  if (pct >= 50) return { text: 'Хороший результат. Обратите внимание на разделы с ошибками и повторите материал.', color: '#F4A261', icon: Star };
  return { text: 'Рекомендуем повторить теоретический материал в соответствующих модулях.', color: '#E84545', icon: AlertTriangle };
}

// ─── Sub-Components ──────────────────────────────────────────────────

function ScoreCircle({ percentage, totalCorrect, totalQuestions }: { percentage: number; totalCorrect: number; totalQuestions: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#25303D" strokeWidth="8" />
          <motion.circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="#4ECDC4"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-heading text-4xl font-semibold text-text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      </div>
      <p className="text-body-lg text-text-secondary">
        {totalCorrect} из {totalQuestions} правильных ответов
      </p>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────

export default function Tests() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'ddx' | 'cognitive'>('timeline');

  // ─ Test 1: Cytokine Timeline ─
  const [selectedOrder, setSelectedOrder] = useState<CytokineKey[]>([]);
  const [timelineChecked, setTimelineChecked] = useState(false);
  const [timelineScore, setTimelineScore] = useState(0);
  const [shakeCards, setShakeCards] = useState<Record<number, boolean>>({});

  // ─ Test 2: Biomarker DDx ─
  const [ddxCaseIndex, setDdxCaseIndex] = useState(0);
  const [ddxAnswers, setDdxAnswers] = useState<Record<number, number>>({});
  const [ddxChecked, setDdxChecked] = useState<Record<number, boolean>>({});
  const [ddxScores, setDdxScores] = useState(0);

  // ─ Test 3: Cognitive Traps ─
  const [cogIndex, setCogIndex] = useState(0);
  const [cogAnswers, setCogAnswers] = useState<Record<number, number>>({});
  const [cogChecked, setCogChecked] = useState<Record<number, boolean>>({});
  const [cogScores, setCogScores] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // ─ Results ─
  const [showResults, setShowResults] = useState(false);

  // ─ Stats ─
  const totalTestsCompleted = (timelineChecked ? 1 : 0) + (Object.keys(ddxChecked).length >= BIOMARKER_CASES.length ? 1 : 0) + (Object.keys(cogChecked).length >= COGNITIVE_SCENARIOS.length ? 1 : 0);
  const totalQuestions = 6 + BIOMARKER_CASES.length + COGNITIVE_SCENARIOS.length;
  const totalCorrect = timelineScore + ddxScores + cogScores;

  const handleCytokineClick = (c: CytokineKey) => {
    if (timelineChecked) return;
    setSelectedOrder((prev) => {
      if (prev.includes(c)) return prev.filter((x) => x !== c);
      if (prev.length >= 6) return prev;
      return [...prev, c];
    });
  };

  const checkTimeline = () => {
    if (selectedOrder.length !== 6) return;
    let score = 0;
    const newShake: Record<number, boolean> = {};
    selectedOrder.forEach((c, i) => {
      if (c === CORRECT_ORDER[i]) score++;
      else newShake[i] = true;
    });
    setTimelineScore(score);
    setShakeCards(newShake);
    setTimelineChecked(true);
  };

  const resetTimeline = () => {
    setSelectedOrder([]);
    setTimelineChecked(false);
    setTimelineScore(0);
    setShakeCards({});
  };

  const handleDdxAnswer = (caseIdx: number, optIdx: number) => {
    if (ddxChecked[caseIdx]) return;
    setDdxAnswers((prev) => ({ ...prev, [caseIdx]: optIdx }));
    const isCorrect = optIdx === BIOMARKER_CASES[caseIdx].correctIndex;
    if (isCorrect) setDdxScores((s) => s + 1);
    setDdxChecked((prev) => ({ ...prev, [caseIdx]: true }));
  };

  const nextDdxCase = () => {
    if (ddxCaseIndex < BIOMARKER_CASES.length - 1) {
      setDdxCaseIndex((i) => i + 1);
    }
  };

  const handleCogAnswer = (scenarioIdx: number, optIdx: number) => {
    if (cogChecked[scenarioIdx]) return;
    setCogAnswers((prev) => ({ ...prev, [scenarioIdx]: optIdx }));
    const isCorrect = optIdx === COGNITIVE_SCENARIOS[scenarioIdx].correctIndex;
    if (isCorrect) setCogScores((s) => s + 1);
    setCogChecked((prev) => ({ ...prev, [scenarioIdx]: true }));
  };

  const nextCogScenario = () => {
    if (cogIndex < COGNITIVE_SCENARIOS.length - 1) {
      setCogIndex((i) => i + 1);
      setShowHint(false);
    }
  };

  const finishAllTests = () => {
    setShowResults(true);
  };

  const resetAll = () => {
    setActiveTab('timeline');
    setSelectedOrder([]);
    setTimelineChecked(false);
    setTimelineScore(0);
    setShakeCards({});
    setDdxCaseIndex(0);
    setDdxAnswers({});
    setDdxChecked({});
    setDdxScores(0);
    setCogIndex(0);
    setCogAnswers({});
    setCogChecked({});
    setCogScores(0);
    setShowHint(false);
    setShowResults(false);
  };

  const allDdxCompleted = Object.keys(ddxChecked).length >= BIOMARKER_CASES.length;
  const allCogCompleted = Object.keys(cogChecked).length >= COGNITIVE_SCENARIOS.length;

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh]">
      {/* ── Section 1: Page Header ── */}
      <section className="px-4 sm:px-6 pt-16 pb-8 max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <p className="text-body-sm text-text-muted mb-3">
            <Link to="/" className="hover:text-text-secondary transition-colors">Главная</Link>
            {' / '}
            <Link to="/" className="hover:text-text-secondary transition-colors">Модули</Link>
            {' / '}Тесты для самопроверки
          </p>
          <h1 className="font-heading text-display-lg font-semibold text-text-primary mb-3">
            Тесты для самопроверки
          </h1>
          <p className="text-body-lg text-text-secondary max-w-[640px] mb-6">
            Интерактивные тесты: временная шкала цитокинов, дифференциальная диагностика по биомаркерам, кейсы с когнитивными ловушками
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-text-secondary">
              <Trophy className="h-4 w-4 text-teal-400" />
              <span className="text-body-md">Пройдено тестов: {totalTestsCompleted}/3</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Target className="h-4 w-4 text-teal-400" />
              <span className="text-body-md">
                Средний балл: {totalTestsCompleted > 0 ? `${Math.round((totalCorrect / totalQuestions) * 100)}%` : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Star className="h-4 w-4 text-teal-400" />
              <span className="text-body-md">Лучший результат: {timelineChecked || allDdxCompleted || allCogCompleted ? `${Math.round((totalCorrect / totalQuestions) * 100)}%` : '—'}</span>
            </div>
          </div>
        </motion.div>

        {/* Module tabs */}
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          {([
            { key: 'timeline' as const, label: 'Временная шкала', icon: Clock },
            { key: 'ddx' as const, label: 'Биомаркерный DDx', icon: Activity },
            { key: 'cognitive' as const, label: 'Когнитивные ловушки', icon: Brain },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={
                t.key === activeTab
                  ? 'px-5 py-2.5 rounded-full text-sm font-medium bg-teal-400 text-text-inverse transition-all duration-200'
                  : 'px-5 py-2.5 rounded-full text-sm font-medium bg-bg-secondary border border-border-subtle text-text-secondary hover:border-teal-400 hover:text-text-primary transition-all duration-200'
              }
            >
              <span className="flex items-center gap-2">
                <t.icon className="h-4 w-4" />
                {t.label}
              </span>
            </button>
          ))}
        </motion.div>
      </section>

      {/* ── Section 2: Test 1 — Cytokine Timeline ── */}
      {activeTab === 'timeline' && (
        <motion.section
          className="bg-bg-secondary border-t border-border-subtle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <p className="text-label text-teal-400 uppercase tracking-widest mb-2">ТЕСТ 1</p>
              <h2 className="font-heading text-display-md font-semibold text-text-primary mb-2">
                Временная шкала цитокинов
              </h2>
              <p className="text-body-md text-text-secondary mb-4">
                Расположите биомаркеры в правильном порядке по времени пика концентрации при остром перитоните.
              </p>
              <div className="flex items-start gap-3 bg-bg-tertiary rounded-md p-4 mb-8">
                <Info className="h-4 w-4 text-text-muted mt-0.5 flex-shrink-0" />
                <p className="text-body-sm text-text-muted">
                  Нажимайте на карточки биомаркеров, чтобы разместить их в правильной последовательности от самого раннего пика до самого позднего. Нажмите еще раз, чтобы убрать.
                </p>
              </div>
            </motion.div>

            {/* Timeline slots */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 mb-6">
                {Array.from({ length: 6 }).map((_, i) => {
                  const cytokine = selectedOrder[i];
                  const data = cytokine ? CYTOKINES.find((c) => c.key === cytokine) : null;
                  const isCorrect = timelineChecked && cytokine === CORRECT_ORDER[i];
                  const isIncorrect = timelineChecked && cytokine && cytokine !== CORRECT_ORDER[i];
                  const shouldShake = shakeCards[i];

                  return (
                    <motion.div
                      key={`slot-${i}`}
                      className={
                        cytokine
                          ? 'w-[160px] min-h-[100px] rounded-md border p-3 flex flex-col gap-2'
                          : 'w-[160px] min-h-[100px] rounded-md border-2 border-dashed border-border-subtle p-3 flex items-center justify-center'
                      }
                      style={
                        data
                          ? {
                              borderLeftWidth: '4px',
                              borderLeftColor: data.color,
                              borderColor: isCorrect ? '#2A9D8F' : isIncorrect ? '#E84545' : '#25303D',
                              backgroundColor: isCorrect ? 'rgba(42,157,143,0.08)' : isIncorrect ? 'rgba(232,69,69,0.08)' : '#0B0F14',
                            }
                          : undefined
                      }
                      initial={{ opacity: 0, y: 16 }}
                      animate={{
                        opacity: 1,
                        y: shouldShake ? [0, -4, 4, -4, 4, 0] : 0,
                      }}
                      transition={{
                        opacity: { duration: 0.3, delay: i * 0.06 },
                        y: shouldShake
                          ? { duration: 0.3, ease: 'easeInOut' }
                          : { duration: 0.3, delay: i * 0.06 },
                      }}
                      onClick={() => {
                        if (cytokine && !timelineChecked) handleCytokineClick(cytokine);
                      }}
                    >
                      {cytokine && data ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-label text-text-muted">{i + 1}</span>
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                            </div>
                            {!timelineChecked && <GripVertical className="h-3.5 w-3.5 text-text-muted" />}
                            {timelineChecked && isCorrect && <Check className="h-4 w-4 text-success-green" />}
                            {timelineChecked && isIncorrect && <X className="h-4 w-4 text-alert-red" />}
                          </div>
                          <span className="font-heading text-heading-md text-text-primary">{data.key}</span>
                          {timelineChecked && (
                            <motion.span
                              className="text-body-sm font-mono-data"
                              style={{ color: data.color }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              {data.peakTime}
                            </motion.span>
                          )}
                        </>
                      ) : (
                        <span className="text-body-sm text-text-muted font-heading">{i + 1}</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Cytokine pool */}
              <div className="flex flex-wrap gap-3">
                {CYTOKINES.map((c, i) => {
                  const isUsed = selectedOrder.includes(c.key);
                  return (
                    <motion.button
                      key={c.key}
                      onClick={() => handleCytokineClick(c.key)}
                      className={
                        isUsed
                          ? 'w-[160px] h-[60px] rounded-md border border-border-subtle bg-bg-tertiary opacity-40 cursor-not-allowed flex items-center gap-3 px-3'
                          : 'w-[160px] h-[60px] rounded-md border border-border-subtle bg-bg-primary hover:border-teal-400 cursor-pointer flex items-center gap-3 px-3 transition-all duration-150'
                      }
                      style={!isUsed ? { borderLeftWidth: '4px', borderLeftColor: c.color } : undefined}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: isUsed ? 0.4 : 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      whileHover={!isUsed && !timelineChecked ? { scale: 1.03, y: -2 } : undefined}
                      whileTap={!isUsed && !timelineChecked ? { scale: 0.98 } : undefined}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="font-heading text-heading-md text-text-primary">{c.key}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Check / Reset buttons */}
            {!timelineChecked ? (
              <motion.button
                onClick={checkTimeline}
                disabled={selectedOrder.length !== 6}
                className={
                  selectedOrder.length === 6
                    ? 'w-full h-[52px] rounded-md bg-teal-400 text-text-inverse font-medium text-body-lg hover:bg-teal-500 transition-colors duration-150'
                    : 'w-full h-[52px] rounded-md bg-bg-tertiary text-text-muted font-medium text-body-lg cursor-not-allowed'
                }
                whileHover={selectedOrder.length === 6 ? { scale: 1.01 } : undefined}
                whileTap={selectedOrder.length === 6 ? { scale: 0.99 } : undefined}
              >
                Проверить ответ
              </motion.button>
            ) : (
              <>
                <motion.div
                  className="mb-6 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <p
                    className="font-heading text-data-lg font-medium"
                    style={{ color: getScoreColor((timelineScore / 6) * 100) }}
                  >
                    Результат: {timelineScore}/6 правильных
                  </p>
                </motion.div>

                {/* Explanation */}
                <motion.div
                  className="bg-bg-tertiary rounded-md p-6 mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.4 }}
                >
                  <h4 className="font-heading text-heading-md text-text-primary mb-4">Правильный порядок:</h4>
                  <div className="space-y-3">
                    {CORRECT_ORDER.map((key, i) => {
                      const c = CYTOKINES.find((x) => x.key === key)!;
                      const userPos = selectedOrder.indexOf(key);
                      const userCorrect = userPos === i;
                      return (
                        <div key={key} className="flex items-start gap-3">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <span className="text-label text-text-muted">{i + 1}</span>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                            <span className="font-heading text-heading-md text-text-primary">{key}</span>
                          </div>
                          <span className="text-body-sm text-text-secondary">{c.peakTime} — {c.explanation}</span>
                          {userCorrect ? (
                            <Check className="h-4 w-4 text-success-green flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-4 w-4 text-alert-red flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                <button
                  onClick={resetTimeline}
                  className="w-full h-[52px] rounded-md border border-teal-400 text-teal-400 font-medium text-body-lg hover:bg-teal-400/10 transition-colors duration-150 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Пройти заново
                </button>
              </>
            )}
          </div>
        </motion.section>
      )}

      {/* ── Section 3: Test 2 — Biomarker DDx ── */}
      {activeTab === 'ddx' && (
        <motion.section
          className="border-t border-border-subtle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <p className="text-label text-teal-400 uppercase tracking-widest mb-2">ТЕСТ 2</p>
              <h2 className="font-heading text-display-md font-semibold text-text-primary mb-2">
                Дифференциальная диагностика по биомаркерам
              </h2>
              <p className="text-body-md text-text-secondary mb-6">
                Даны значения биомаркеров — выберите наиболее вероятный диагноз из предложенных вариантов.
              </p>
            </motion.div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-label text-text-muted">КЕЙС {ddxCaseIndex + 1} ИЗ {BIOMARKER_CASES.length}</span>
                <span className="text-body-sm text-text-muted font-mono-data">{Math.round(((ddxCaseIndex + 1) / BIOMARKER_CASES.length) * 100)}%</span>
              </div>
              <div className="flex gap-1">
                {BIOMARKER_CASES.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-2 rounded-full"
                    style={{
                      backgroundColor: i < ddxCaseIndex ? '#4ECDC4' : i === ddxCaseIndex ? '#4ECDC4' : '#19202A',
                      opacity: i === ddxCaseIndex ? 1 : i < ddxCaseIndex ? 0.8 : 0.5,
                    }}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!allDdxCompleted ? (
                <motion.div
                  key={`ddx-case-${ddxCaseIndex}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="max-w-[700px] mx-auto"
                >
                  <p className="text-label text-text-muted mb-4">КЕЙС {BIOMARKER_CASES[ddxCaseIndex].id} ИЗ {BIOMARKER_CASES.length}</p>

                  {/* Vignette */}
                  <div className="bg-bg-secondary rounded-md border border-border-subtle p-6 mb-6">
                    <p className="text-body-md text-text-primary leading-relaxed">
                      {BIOMARKER_CASES[ddxCaseIndex].vignette}
                    </p>
                  </div>

                  {/* Biomarker panel */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {BIOMARKER_CASES[ddxCaseIndex].biomarkers.map((b, i) => (
                      <motion.div
                        key={b.name}
                        className="flex items-center gap-2 rounded-md px-3 py-2"
                        style={{
                          backgroundColor: severityBg(b.severity),
                          border: `1px solid ${severityColor(b.severity)}20`,
                        }}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.08 }}
                      >
                        <span className="text-body-sm text-text-secondary">{b.name}:</span>
                        <span className="font-mono-data text-body-md font-medium" style={{ color: severityColor(b.severity) }}>
                          {b.value}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {BIOMARKER_CASES[ddxCaseIndex].options.map((opt, i) => {
                      const isChecked = ddxChecked[ddxCaseIndex];
                      const userAnswer = ddxAnswers[ddxCaseIndex];
                      const isCorrect = i === BIOMARKER_CASES[ddxCaseIndex].correctIndex;
                      const isSelected = userAnswer === i;
                      const showCorrect = isChecked && isCorrect;
                      const showIncorrect = isChecked && isSelected && !isCorrect;

                      return (
                        <motion.button
                          key={i}
                          onClick={() => handleDdxAnswer(ddxCaseIndex, i)}
                          className={
                            showCorrect
                              ? 'rounded-md border-2 border-success-green bg-success-green/10 p-5 text-left transition-all duration-150'
                              : showIncorrect
                                ? 'rounded-md border-2 border-alert-red bg-alert-red/10 p-5 text-left transition-all duration-150'
                                : 'rounded-md border border-border-subtle bg-bg-secondary p-5 text-left hover:border-teal-400 transition-all duration-150'
                          }
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.06 }}
                          whileHover={!isChecked ? { y: -2 } : undefined}
                          disabled={isChecked}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={
                                showCorrect
                                  ? 'w-7 h-7 rounded-full bg-success-green text-text-inverse flex items-center justify-center text-sm font-medium flex-shrink-0'
                                  : showIncorrect
                                    ? 'w-7 h-7 rounded-full bg-alert-red text-text-inverse flex items-center justify-center text-sm font-medium flex-shrink-0'
                                    : 'w-7 h-7 rounded-full bg-bg-tertiary border border-border-subtle text-teal-400 flex items-center justify-center text-sm font-medium flex-shrink-0'
                              }
                            >
                              {showCorrect ? <Check className="h-4 w-4" /> : showIncorrect ? <X className="h-4 w-4" /> : String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-body-md font-medium text-text-primary">{opt}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  <AnimatePresence>
                    {ddxChecked[ddxCaseIndex] && (
                      <motion.div
                        className="bg-bg-tertiary rounded-md p-6 mb-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <p className="font-heading text-heading-md text-text-primary mb-3">
                          Правильный ответ: {String.fromCharCode(65 + BIOMARKER_CASES[ddxCaseIndex].correctIndex)} — {BIOMARKER_CASES[ddxCaseIndex].options[BIOMARKER_CASES[ddxCaseIndex].correctIndex]}
                        </p>
                        <p className="text-body-md text-text-secondary mb-4">
                          {BIOMARKER_CASES[ddxCaseIndex].explanation}
                        </p>
                        <div className="mb-4">
                          <p className="text-label text-teal-400 mb-2">КЛЮЧЕВЫЕ ДИФФЕРЕНЦИАЛЬНЫЕ МАРКЁРЫ:</p>
                          <ul className="space-y-1">
                            {BIOMARKER_CASES[ddxCaseIndex].keyMarkers.map((m, i) => (
                              <li key={i} className="text-body-sm text-text-secondary flex items-start gap-2">
                                <span className="text-teal-400 mt-1">•</span>
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Link
                          to={BIOMARKER_CASES[ddxCaseIndex].moduleLink}
                          className="text-body-sm text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1"
                        >
                          → Подробнее в модуле
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex justify-end">
                    {ddxChecked[ddxCaseIndex] && (
                      <motion.button
                        onClick={ddxCaseIndex < BIOMARKER_CASES.length - 1 ? nextDdxCase : finishAllTests}
                        className="px-6 py-3 rounded-md bg-teal-400 text-text-inverse font-medium hover:bg-teal-500 transition-colors duration-150 flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {ddxCaseIndex < BIOMARKER_CASES.length - 1 ? 'Следующий кейс' : 'Завершить DDx'}
                        <ChevronRight className="h-4 w-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <Check className="h-12 w-12 text-success-green mx-auto mb-4" />
                  <h3 className="font-heading text-display-md font-semibold text-text-primary mb-2">
                    Тест пройден!
                  </h3>
                  <p className="text-body-lg text-text-secondary mb-4">
                    Результат: {ddxScores}/{BIOMARKER_CASES.length} верных диагнозов
                  </p>
                  <button
                    onClick={finishAllTests}
                    className="px-6 py-3 rounded-md bg-teal-400 text-text-inverse font-medium hover:bg-teal-500 transition-colors duration-150"
                  >
                    Перейти к результатам
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {/* ── Section 4: Test 3 — Cognitive Traps ── */}
      {activeTab === 'cognitive' && (
        <motion.section
          className="bg-bg-secondary border-t border-border-subtle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <p className="text-label text-purple-accent uppercase tracking-widest mb-2">ТЕСТ 3</p>
              <h2 className="font-heading text-display-md font-semibold text-text-primary mb-2">
                Когнитивные ловушки в диагностике
              </h2>
              <p className="text-body-md text-text-secondary mb-6">
                Кейсы, специально подобранные для демонстрации типичных когнитивных ошибок в экстренной хирургии. Узнайте свои слепые зоны.
              </p>
            </motion.div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-label text-text-muted">СЦЕНАРИЙ {cogIndex + 1} ИЗ {COGNITIVE_SCENARIOS.length}</span>
                <span className="text-body-sm text-text-muted font-mono-data">{Math.round(((cogIndex + 1) / COGNITIVE_SCENARIOS.length) * 100)}%</span>
              </div>
              <div className="flex gap-1">
                {COGNITIVE_SCENARIOS.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-2 rounded-full"
                    style={{
                      backgroundColor: i < cogIndex ? '#9B5DE5' : i === cogIndex ? '#9B5DE5' : '#19202A',
                      opacity: i === cogIndex ? 1 : i < cogIndex ? 0.8 : 0.5,
                    }}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!allCogCompleted ? (
                <motion.div
                  key={`cog-${cogIndex}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="max-w-[700px] mx-auto"
                >
                  {/* Trap label */}
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
                    style={{ backgroundColor: `${COGNITIVE_SCENARIOS[cogIndex].trapColor}15`, border: `1px solid ${COGNITIVE_SCENARIOS[cogIndex].trapColor}40` }}
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: [1, 1.03, 1, 1.03, 1] }}
                    transition={{
                      opacity: { duration: 0.3 },
                      scale: { duration: 2, times: [0, 0.25, 0.5, 0.75, 1] },
                    }}
                  >
                    <AlertTriangle className="h-4 w-4" style={{ color: COGNITIVE_SCENARIOS[cogIndex].trapColor }} />
                    <span className="text-body-sm font-medium" style={{ color: COGNITIVE_SCENARIOS[cogIndex].trapColor }}>
                      ЛОВУШКА: {COGNITIVE_SCENARIOS[cogIndex].trapLabel}
                    </span>
                  </motion.div>

                  {/* Scenario */}
                  <div className="bg-bg-secondary rounded-md border border-border-subtle p-6 mb-4">
                    <p className="text-body-lg text-text-primary leading-relaxed mb-4">
                      {COGNITIVE_SCENARIOS[cogIndex].scenario}
                    </p>

                    {/* Hint toggle */}
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-2 text-body-sm text-alert-yellow hover:text-alert-orange transition-colors mb-3"
                    >
                      <Lightbulb className="h-4 w-4" />
                      {showHint ? 'Скрыть подсказку' : 'Подсказка'}
                    </button>
                    <AnimatePresence>
                      {showHint && (
                        <motion.div
                          className="bg-alert-yellow/10 border border-alert-yellow/30 rounded-md p-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-body-sm text-text-secondary">
                            <span className="text-alert-yellow font-medium">⚠ Что вы могли упустить? </span>
                            {COGNITIVE_SCENARIOS[cogIndex].hint}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    {COGNITIVE_SCENARIOS[cogIndex].options.map((opt, i) => {
                      const isChecked = cogChecked[cogIndex];
                      const userAnswer = cogAnswers[cogIndex];
                      const isCorrect = i === COGNITIVE_SCENARIOS[cogIndex].correctIndex;
                      const isSelected = userAnswer === i;
                      const showCorrect = isChecked && isCorrect;
                      const showIncorrect = isChecked && isSelected && !isCorrect;

                      return (
                        <motion.button
                          key={i}
                          onClick={() => handleCogAnswer(cogIndex, i)}
                          className={
                            showCorrect
                              ? 'rounded-md border-2 border-success-green bg-success-green/10 p-5 text-left transition-all duration-150'
                              : showIncorrect
                                ? 'rounded-md border-2 border-alert-red bg-alert-red/10 p-5 text-left transition-all duration-150'
                                : 'rounded-md border border-border-subtle bg-bg-primary p-5 text-left hover:border-teal-400 transition-all duration-150'
                          }
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.06 }}
                          whileHover={!isChecked ? { y: -2 } : undefined}
                          disabled={isChecked}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={
                                showCorrect
                                  ? 'w-7 h-7 rounded-full bg-success-green text-text-inverse flex items-center justify-center text-sm font-medium flex-shrink-0'
                                  : showIncorrect
                                    ? 'w-7 h-7 rounded-full bg-alert-red text-text-inverse flex items-center justify-center text-sm font-medium flex-shrink-0'
                                    : 'w-7 h-7 rounded-full bg-bg-tertiary border border-border-subtle text-teal-400 flex items-center justify-center text-sm font-medium flex-shrink-0'
                              }
                            >
                              {showCorrect ? <Check className="h-4 w-4" /> : showIncorrect ? <X className="h-4 w-4" /> : String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-body-md font-medium text-text-primary">{opt}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  <AnimatePresence>
                    {cogChecked[cogIndex] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {/* Trap explanation */}
                        <motion.div
                          className="bg-alert-red/10 border border-alert-red/30 rounded-md p-5 mb-4"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-alert-red flex-shrink-0 mt-0.5" />
                            <p className="font-heading text-heading-md text-alert-red">Ловушка разоблачена</p>
                          </div>
                          <p className="text-body-md text-text-secondary">
                            {COGNITIVE_SCENARIOS[cogIndex].trapExplanation}
                          </p>
                        </motion.div>

                        {/* Lesson */}
                        <motion.div
                          className="bg-teal-400/10 border border-teal-400/30 rounded-md p-5 mb-6"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <Lightbulb className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                            <p className="font-heading text-heading-md text-teal-400">Урок</p>
                          </div>
                          <p className="text-body-md text-text-secondary">
                            {COGNITIVE_SCENARIOS[cogIndex].lesson}
                          </p>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex justify-end">
                    {cogChecked[cogIndex] && (
                      <motion.button
                        onClick={cogIndex < COGNITIVE_SCENARIOS.length - 1 ? nextCogScenario : finishAllTests}
                        className="px-6 py-3 rounded-md bg-teal-400 text-text-inverse font-medium hover:bg-teal-500 transition-colors duration-150 flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {cogIndex < COGNITIVE_SCENARIOS.length - 1 ? 'Следующий сценарий' : 'Завершить тест'}
                        <ChevronRight className="h-4 w-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <Brain className="h-12 w-12 text-purple-accent mx-auto mb-4" />
                  <h3 className="font-heading text-display-md font-semibold text-text-primary mb-2">
                    Все сценарии пройдены!
                  </h3>
                  <p className="text-body-lg text-text-secondary mb-4">
                    Результат: {cogScores}/{COGNITIVE_SCENARIOS.length} верных решений
                  </p>
                  <button
                    onClick={finishAllTests}
                    className="px-6 py-3 rounded-md bg-teal-400 text-text-inverse font-medium hover:bg-teal-500 transition-colors duration-150"
                  >
                    Перейти к результатам
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {/* ── Section 5: Final Results ── */}
      <AnimatePresence>
        {showResults && (
          <motion.section
            className="border-t border-border-subtle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              >
                <h2 className="font-heading text-display-lg font-semibold text-text-primary mb-8">
                  Результаты самопроверки
                </h2>
              </motion.div>

              {/* Score circle */}
              <ScoreCircle
                percentage={(totalCorrect / totalQuestions) * 100}
                totalCorrect={totalCorrect}
                totalQuestions={totalQuestions}
              />

              {/* Per-test breakdown */}
              <motion.div
                className="mt-10 space-y-5 text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <h3 className="font-heading text-heading-md text-text-primary text-center mb-6">Разбор по тестам</h3>

                {/* Test 1 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body-md text-text-secondary">Временная шкала цитокинов</span>
                    <span className="font-mono-data text-body-md text-text-primary">{timelineScore}/6</span>
                  </div>
                  <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getScoreColor((timelineScore / 6) * 100) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(timelineScore / 6) * 100}%` }}
                      transition={{ delay: 1.0, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    />
                  </div>
                </div>

                {/* Test 2 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body-md text-text-secondary">Биомаркерный DDx</span>
                    <span className="font-mono-data text-body-md text-text-primary">{ddxScores}/{BIOMARKER_CASES.length}</span>
                  </div>
                  <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getScoreColor((ddxScores / BIOMARKER_CASES.length) * 100) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(ddxScores / BIOMARKER_CASES.length) * 100}%` }}
                      transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    />
                  </div>
                </div>

                {/* Test 3 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body-md text-text-secondary">Когнитивные ловушки</span>
                    <span className="font-mono-data text-body-md text-text-primary">{cogScores}/{COGNITIVE_SCENARIOS.length}</span>
                  </div>
                  <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getScoreColor((cogScores / COGNITIVE_SCENARIOS.length) * 100) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(cogScores / COGNITIVE_SCENARIOS.length) * 100}%` }}
                      transition={{ delay: 1.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Performance message */}
              <motion.div
                className="mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
              >
                {(() => {
                  const msg = getScoreMessage((totalCorrect / totalQuestions) * 100);
                  const Icon = msg.icon;
                  return (
                    <div className="flex flex-col items-center gap-3">
                      <Icon className="h-8 w-8" style={{ color: msg.color }} />
                      <p className="text-body-lg font-medium" style={{ color: msg.color }}>
                        {msg.text}
                      </p>
                    </div>
                  );
                })()}
              </motion.div>

              {/* Recommendations */}
              {(timelineScore < 5 || ddxScores < 4 || cogScores < 3) && (
                <motion.div
                  className="mt-8 bg-bg-tertiary rounded-md p-6 text-left"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8, duration: 0.4 }}
                >
                  <p className="font-heading text-heading-md text-text-primary mb-3">Рекомендации</p>
                  <div className="space-y-2">
                    {timelineScore < 5 && (
                      <Link to="/molecular" className="text-body-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-2">
                        <ArrowRight className="h-3.5 w-3.5" />
                        → Повторить TISCPA каскад в модуле Молекулярный патогенез
                      </Link>
                    )}
                    {ddxScores < 4 && (
                      <Link to="/biomarkers" className="text-body-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-2">
                        <ArrowRight className="h-3.5 w-3.5" />
                        → Пройти биомаркерный калькулятор
                      </Link>
                    )}
                    {cogScores < 3 && (
                      <Link to="/diagnostics" className="text-body-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-2">
                        <ArrowRight className="h-3.5 w-3.5" />
                        → Изучить маски острого живота
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action buttons */}
              <motion.div
                className="mt-10 flex flex-wrap items-center justify-center gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0, duration: 0.4 }}
              >
                <button
                  onClick={resetAll}
                  className="px-6 py-3 rounded-md border border-teal-400 text-teal-400 font-medium hover:bg-teal-400/10 transition-colors duration-150 flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Пройти тесты заново
                </button>
                <Link
                  to="/"
                  className="px-6 py-3 rounded-md bg-bg-tertiary text-text-primary font-medium hover:bg-bg-elevated transition-colors duration-150 flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Вернуться к модулям
                </Link>
                {(totalCorrect / totalQuestions) * 100 >= 80 && (
                  <button className="px-6 py-3 rounded-md border border-alert-yellow text-alert-yellow font-medium hover:bg-alert-yellow/10 transition-colors duration-150 flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Распечатать сертификат
                  </button>
                )}
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
