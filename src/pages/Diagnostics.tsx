import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Activity,
  Droplets,
  Heart,
  Wind,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Stethoscope,
  Printer,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

/* ───────── animation helpers ───────── */

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo, delay: i * 0.06 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardSlideLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

const cardSlideRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

/* ───────── types ───────── */

type TabKey = 'endocrine' | 'hematological' | 'cardiothoracic' | 'algorithm';

/* ───────── tab config ───────── */

const tabs: { key: TabKey; label: string }[] = [
  { key: 'endocrine', label: 'Эндокринные' },
  { key: 'hematological', label: 'Гематологические' },
  { key: 'cardiothoracic', label: 'Кардиоторакальные' },
  { key: 'algorithm', label: 'Алгоритмы исключения' },
];

/* ───────── data: exclusion algorithm steps ───────── */

interface AlgorithmStep {
  id: number;
  title: string;
  test: string;
  normalNext: string | null;
  abnormalNext: string | null;
  abnormalResult: string;
  detail: string;
  normalCriteria: string;
  abnormalCriteria: string;
  action: string;
  icon: React.ReactNode;
}

const algorithmSteps: AlgorithmStep[] = [
  {
    id: 1,
    title: 'ЭКГ + Тропонин',
    test: 'Тропонин I/T',
    normalNext: 'Шаг 2',
    abnormalNext: null,
    abnormalResult: 'ИМ нижней стенки!',
    detail: 'Инфаркт нижней стенки в 10–15% случаев маскируется под «желудочный» живот. ЭКГ — обязательно в первые 10 минут.',
    normalCriteria: 'Тропонин норма, ЭКГ без ST ↑ II, III, aVF',
    abnormalCriteria: 'Тропонин ↑↑, ST ↑ II, III, aVF',
    action: 'ЭКГ в первые 10 минут → тропонин. Нормальная ЭКГ ИСКЛЮЧАЕТ ИМ в > 95%.',
    icon: <Activity className="h-5 w-5" />,
  },
  {
    id: 2,
    title: 'Глюкоза + Кетоны',
    test: 'Глюкоза + кетоновые тела',
    normalNext: 'Шаг 3',
    abnormalNext: null,
    abnormalResult: 'ДКА!',
    detail: 'Диабетический кетоацидоз — боль в животе присутствует в 40–75% случаев. Триада: гипергликемия + кетонемия + pH < 7.30.',
    normalCriteria: 'Глюкоза < 11.1, кетоны < 0.6',
    abnormalCriteria: 'Глюкоза > 13.9, кетоны > 3.0, pH < 7.30',
    action: 'При подозрении на ДКА: глюкоза + кетоны в моче/крови → анионный промежуток → PCT.',
    icon: <FlaskConical className="h-5 w-5" />,
  },
  {
    id: 3,
    title: 'Кортизол + АКТГ',
    test: 'Кортизол + ACTH',
    normalNext: 'Шаг 4',
    abnormalNext: null,
    abnormalResult: 'Аддисонов криз!',
    detail: 'Аддисонов криз — острая боль в животе, гипотензия, тошнота, рвота. Триада: боль + шок + гипонатриемия/гиперкалиемия.',
    normalCriteria: 'Кортизол > 138, ACTH 10–60',
    abnormalCriteria: 'Кортизол < 138, ACTH > 100, Na < 135, K > 5.0',
    action: 'Подозрение → кортизол + ACTH → при кортизоле < 138: гидрокортизон 100 мг в/в немедленно → эффект в течение 1–2 часов подтверждает диагноз.',
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    id: 4,
    title: 'HbS + Анамнез СКА',
    test: 'Гемоглобинопатия + HbS',
    normalNext: 'Шаг 5',
    abnormalNext: null,
    abnormalResult: 'Вазоокклюзивный криз СКА!',
    detail: 'Серповидно-клеточная анемия — острая боль в животе, тошнота, лихорадка. До 30% ненужных операций при вазоокклюзивном кризе.',
    normalCriteria: 'HbS отсутствует, нет анамнеза СКА',
    abnormalCriteria: 'HbS > 50%, известная СКА',
    action: '1. Анамнез + гемоглобинопатия | 2. PCT | 3. При ↑ PCT — кровевые культуры (Salmonella spp. — специфичный патоген СКА).',
    icon: <Wind className="h-5 w-5" />,
  },
  {
    id: 5,
    title: 'Порфобилиноген (моча)',
    test: 'Порфобилиноген + Δ-ALA',
    normalNext: 'Шаг 6',
    abnormalNext: null,
    abnormalResult: 'Острая порфирия!',
    detail: 'Острая интермиттирующая порфирия — «великий симулятор». Острая колющая боль, тахикардия, психические расстройства — при мягкой брюшной стенке.',
    normalCriteria: 'Порфобилиноген норма, Δ-ALA норма',
    abnormalCriteria: 'Порфобилиноген ↑↑↑, Δ-ALA ↑↑, тёмная моча',
    action: 'Подозрение → моча на порфобилиноген + Δ-ALA → при положительном: глюкоза в/в, гемин — НЕ барбитураты.',
    icon: <FlaskConical className="h-5 w-5" />,
  },
  {
    id: 6,
    title: 'D-димер + Сатурация',
    test: 'D-димер + SpO2',
    normalNext: 'Шаг 7',
    abnormalNext: null,
    abnormalResult: 'ТЭЛА!',
    detail: 'Тромбоэмболия лёгочной артерии — боль в подложечной области, диспноэ, тахикардия. Может имитировать острый холецистит или панкреатит.',
    normalCriteria: 'D-димер < 500, SpO2 > 94%',
    abnormalCriteria: 'D-димер ↑↑↑, SpO2 < 92%, S1Q3T3 на ЭКГ',
    action: 'D-димер + ЭКГ + КТ-ангиография лёгочных артерий при подтверждённой гипоксемии.',
    icon: <Wind className="h-5 w-5" />,
  },
  {
    id: 7,
    title: 'КТ-ангиография аорты',
    test: 'КТ-ангиография аорты с контрастом',
    normalNext: null,
    abnormalNext: null,
    abnormalResult: 'Диссекция аорты!',
    detail: 'Диссекция / разрыв аорты — «кинжальная» боль в спине/животе. Разница АД между конечностями > 20 мм рт.ст. — ключевой признак.',
    normalCriteria: 'Аорта без диссекции, нет разницы АД',
    abnormalCriteria: 'Диссекция аорты, разница АД > 20 мм рт.ст.',
    action: 'КТ-ангиография аорты с контрастом — НЕ ждите лабораторные данные.',
    icon: <Heart className="h-5 w-5" />,
  },
];

/* ───────── data: master comparison table ───────── */

interface CheatSheetRow {
  mask: string;
  keyTest: string;
  keySign: string;
  pct: string;
  crp: string;
  urgency: string;
  urgencyColor: string;
  linkId: TabKey;
}

const cheatSheetData: CheatSheetRow[] = [
  {
    mask: 'ДКА',
    keyTest: 'Глюкоза + кетоны',
    keySign: '↑↑ Кетоны, норма PCT',
    pct: 'Норм',
    crp: '< 50',
    urgency: 'Высокая',
    urgencyColor: '#F4A261',
    linkId: 'endocrine',
  },
  {
    mask: 'Аддисон',
    keyTest: 'Кортизол + ACTH',
    keySign: 'Гипонатриемия + гиперкалиемия',
    pct: 'Норм',
    crp: '< 50',
    urgency: 'Критическая',
    urgencyColor: '#E84545',
    linkId: 'endocrine',
  },
  {
    mask: 'СКА-криз',
    keyTest: 'HbS + анамнез',
    keySign: 'Известная СКА',
    pct: 'Перемен',
    crp: 'Перемен',
    urgency: 'Высокая',
    urgencyColor: '#F4A261',
    linkId: 'hematological',
  },
  {
    mask: 'Порфирия',
    keyTest: 'Порфобилиноген',
    keySign: 'Мягкое брюшко + тёмная моча',
    pct: 'Норм',
    crp: '< 50',
    urgency: 'Средняя',
    urgencyColor: '#E9C46A',
    linkId: 'hematological',
  },
  {
    mask: 'ИМ (низ)',
    keyTest: 'Тропонин + ЭКГ',
    keySign: 'Тропонин ↑↑, мягкое брюшко',
    pct: 'Норм',
    crp: '< 50',
    urgency: 'Критическая',
    urgencyColor: '#E84545',
    linkId: 'cardiothoracic',
  },
  {
    mask: 'ТЭЛА',
    keyTest: 'D-димер + КТ',
    keySign: 'D-димер ↑↑↑, гипоксемия',
    pct: 'Норм',
    crp: '< 100',
    urgency: 'Критическая',
    urgencyColor: '#E84545',
    linkId: 'cardiothoracic',
  },
  {
    mask: 'Диссекция аорты',
    keyTest: 'КТ-ангиография',
    keySign: 'Разница АД > 20, «кинжальная» боль',
    pct: 'Норм',
    crp: '< 50',
    urgency: 'Критическая',
    urgencyColor: '#E84545',
    linkId: 'cardiothoracic',
  },
  {
    mask: 'Перитонит',
    keyTest: 'Клиника + PCT',
    keySign: 'Напряжение, ↑↑ PCT',
    pct: '> 2.0',
    crp: '> 200',
    urgency: 'Критическая',
    urgencyColor: '#E84545',
    linkId: 'algorithm',
  },
];

/* ───────── section ref map for sidebar / tab nav ───────── */

const sectionRefs: Record<TabKey, string> = {
  endocrine: 'endocrine-section',
  hematological: 'hematological-section',
  cardiothoracic: 'cardiothoracic-section',
  algorithm: 'algorithm-section',
};

/* ───────────────────────── COMPONENT ───────────────────────── */

export default function Diagnostics() {
  const [activeTab, setActiveTab] = useState<TabKey>('endocrine');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const endocrineRef = useRef<HTMLDivElement>(null);
  const hematologicalRef = useRef<HTMLDivElement>(null);
  const cardiothoracicRef = useRef<HTMLDivElement>(null);
  const algorithmRef = useRef<HTMLDivElement>(null);
  const cheatSheetRef = useRef<HTMLDivElement>(null);

  const toggleStep = useCallback((id: number) => {
    setExpandedStep((prev) => (prev === id ? null : id));
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const scrollToSection = useCallback((key: TabKey) => {
    setActiveTab(key);
    const refMap: Record<TabKey, React.RefObject<HTMLDivElement | null>> = {
      endocrine: endocrineRef,
      hematological: hematologicalRef,
      cardiothoracic: cardiothoracicRef,
      algorithm: algorithmRef,
    };
    refMap[key].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  /* ────── RENDER ────── */

  return (
    <div className="min-h-[100dvh] bg-[#0B0F14]">
      {/* ====== SECTION 1: PAGE HEADER ====== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-16 pb-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="mb-4"
          >
            <span className="text-xs font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
              Главная / Модули / Маски острого живота
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.05 }}
            className="font-heading text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#E8ECF0] mb-3"
          >
            Маски острого живота
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.1 }}
            className="text-base font-normal leading-[1.6] text-[#94A3B8] max-w-[680px] mb-6"
          >
            Дифференциальная диагностика эндокринных, гематологических и кардиоторакальных имитаторов острого живота
          </motion.p>

          {/* Alert Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number], delay: 0.15 }}
            className="mb-8 flex items-start gap-3 rounded-lg border border-[#E84545]/30 bg-[#E84545]/10 px-5 py-3"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#E84545]" />
            <p className="text-sm font-medium text-[#E8ECF0]">
              <span className="font-semibold">Внимание:</span> Этот модуль содержит когнитивные ловушки. Всегда исключайте маски перед постановкой диагноза перитонита.
            </p>
          </motion.div>

          {/* Module Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {tabs.map((t, i) => (
              <motion.button
                key={t.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: easeOutExpo, delay: 0.22 + i * 0.04 }}
                onClick={() => scrollToSection(t.key)}
                className={
                  'rounded-full px-5 py-2 text-sm font-medium transition-all duration-150 cursor-pointer ' +
                  (activeTab === t.key
                    ? 'bg-[#4ECDC4] text-[#0B0F14]'
                    : 'bg-[#19202A] text-[#94A3B8] border border-[#25303D] hover:text-[#E8ECF0] hover:border-[#2D8B7A]')
                }
              >
                {t.label}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== SECTION 2: ENDOCRINE MIMICS ====== */}
      <section
        id={sectionRefs.endocrine}
        ref={endocrineRef}
        className="border-t border-[#25303D] bg-[#111820]"
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
          {/* Section label & title */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="mb-2 inline-block text-[11px] font-medium leading-[1.3] tracking-[0.06em] uppercase text-[#E84545]"
            >
              ЭНДОКРИННЫЕ
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-heading text-[28px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#E8ECF0] mb-2"
            >
              Эндокринные имитаторы острого живота
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-sm font-normal leading-[1.55] text-[#94A3B8] mb-8 max-w-[720px]"
            >
              Диабетический кетоацидоз и аддисонов криз — наиболее опасные эндокринные маски, требующие немедленного исключения.
            </motion.p>
          </motion.div>

          {/* Two cards side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DKA Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={cardSlideLeft}
              className="rounded-[10px] border border-[#25303D] bg-[#111820] overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)', borderLeft: '3px solid #E84545' }}
            >
              <div className="p-6" style={{ boxShadow: '0 0 16px rgba(232,69,69,0.08)' }}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h3 className="font-heading text-[22px] font-semibold leading-[1.3] text-[#E84545]">
                    Диабетический кетоацидоз (ДКА)
                  </h3>
                  <span className="animate-pulse-badge inline-flex items-center rounded-full bg-[#E84545]/15 px-3 py-0.5 text-[11px] font-medium tracking-[0.04em] text-[#E84545] border border-[#E84545]/30">
                    КЛЮЧЕВАЯ ЛОВУШКА
                  </span>
                </div>

                <p className="text-sm leading-[1.55] text-[#94A3B8] mb-4">
                  Боли в животе, тошнота, рвота, метаболический ацидоз — классическая картина, ошибочно принимаемая за хирургический живот.
                </p>

                {/* Red flags table */}
                <div className="mb-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#19202A]">
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                          Признак
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#E84545]">
                          ДКА
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                          Перитонит
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#25303D]">
                      {[
                        ['Глюкоза', '> 13.9 mmol/L', 'Норма / слегка ↑'],
                        ['Кетоновые тела', '↑↑↑ > 3.0', 'Норма'],
                        ['pH', '< 7.30', 'Норма / > 7.35'],
                        ['Бикарбонаты', '< 18', 'Норма'],
                        ['Анионный промежуток', '> 12', 'Норма'],
                        ['PCT', 'Норма / < 0.5', '↑↑ > 2.0'],
                        ['CRP', '< 50', '↑↑ > 100'],
                        ['Боль', 'Диффузная, колющая', 'Локализованная, постоянная'],
                        ['Реакция брюшной стенки', 'Мягкая, может отсутствовать', 'Напряжение, резистентность'],
                      ].map(([sign, dka, peritonitis], idx) => (
                        <motion.tr
                          key={sign}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: idx * 0.04, ease: easeOutExpo }}
                          className="hover:bg-[#19202A]/50 transition-colors duration-150"
                        >
                          <td className="px-3 py-2 text-[#E8ECF0] font-medium">{sign}</td>
                          <td className="px-3 py-2 text-[#E84545] font-mono-data">{dka}</td>
                          <td className="px-3 py-2 text-[#94A3B8] font-mono-data">{peritonitis}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Key discriminator */}
                <div
                  className="mb-4 rounded-lg border border-[#E84545]/20 bg-[#E84545]/5 p-4"
                  style={{ boxShadow: '0 0 16px rgba(232,69,69,0.06)' }}
                >
                  <p className="text-sm leading-[1.55] text-[#E8ECF0]">
                    <span className="font-semibold text-[#E84545]">PCT и кетоновые тела</span> — самые быстрые дифференциальные маркеры. PCT нормальный при ДКА исключает бактериальный перитонит.
                  </p>
                </div>

                {/* Action */}
                <div className="flex items-start gap-2">
                  <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-[#4ECDC4]" />
                  <p className="text-sm leading-[1.55] text-[#94A3B8]">
                    <span className="text-[#4ECDC4] font-semibold">Действие:</span>{' '}
                    При подозрении на ДКА: глюкоза + кетоны в моче/крови → анионный промежуток → PCT
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Addison Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={cardSlideRight}
              className="rounded-[10px] border border-[#25303D] bg-[#111820] overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)', borderLeft: '3px solid #E84545' }}
            >
              <div className="p-6" style={{ boxShadow: '0 0 16px rgba(232,69,69,0.08)' }}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h3 className="font-heading text-[22px] font-semibold leading-[1.3] text-[#E84545]">
                    Аддисонов криз
                  </h3>
                  <span className="animate-pulse-badge inline-flex items-center rounded-full bg-[#E84545]/15 px-3 py-0.5 text-[11px] font-medium tracking-[0.04em] text-[#E84545] border border-[#E84545]/30">
                    КЛЮЧЕВАЯ ЛОВУШКА
                  </span>
                </div>

                <p className="text-sm leading-[1.55] text-[#94A3B8] mb-4">
                  Острая боль в животе, гипотензия, тошнота, рвота — часто ошибочно диагностируется как септический живот.
                </p>

                {/* Red flags table */}
                <div className="mb-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#19202A]">
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                          Признак
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#E84545]">
                          Аддисон
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                          Сепсис / Перитонит
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#25303D]">
                      {[
                        ['Кортизол', '↓↓ < 138', 'Норма / ↑'],
                        ['ACTH', '↑↑ > 100', 'Норма'],
                        ['Натрий', '↓ < 135', 'Норма / ↓'],
                        ['Калий', '↑ > 5.0', 'Норма'],
                        ['Глюкоза', '↓ < 3.9', 'Норма / ↑'],
                        ['PCT', 'Норма', '↑↑'],
                        ['Гипотензия', 'Рефрактерная к жидкости', 'Ответ на жидкость'],
                      ].map(([sign, addison, sepsis], idx) => (
                        <motion.tr
                          key={sign}
                          initial={{ opacity: 0, x: 8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: idx * 0.04, ease: easeOutExpo }}
                          className="hover:bg-[#19202A]/50 transition-colors duration-150"
                        >
                          <td className="px-3 py-2 text-[#E8ECF0] font-medium">{sign}</td>
                          <td className="px-3 py-2 text-[#E84545] font-mono-data">{addison}</td>
                          <td className="px-3 py-2 text-[#94A3B8] font-mono-data">{sepsis}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Key discriminator */}
                <div
                  className="mb-4 rounded-lg border border-[#E84545]/20 bg-[#E84545]/5 p-4"
                  style={{ boxShadow: '0 0 16px rgba(232,69,69,0.06)' }}
                >
                  <p className="text-sm leading-[1.55] text-[#E8ECF0]">
                    <span className="font-semibold text-[#E84545]">Гипонатриемия + гиперкалиемия + рефрактерная гипотензия</span> — триада аддисонова криза. ACTH и кортизол — диагностические.
                  </p>
                </div>

                {/* Action */}
                <div className="flex items-start gap-2">
                  <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-[#4ECDC4]" />
                  <p className="text-sm leading-[1.55] text-[#94A3B8]">
                    <span className="text-[#4ECDC4] font-semibold">Действие:</span>{' '}
                    Подозрение → кортизол + ACTH → при кортизоле {'<'} 138: гидрокортизон 100 мг в/в немедленно → эффект в течение 1–2 часов подтверждает диагноз
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== SECTION 3: HAEMATOLOGICAL MIMICS ====== */}
      <section
        id={sectionRefs.hematological}
        ref={hematologicalRef}
        className="border-t border-[#25303D]"
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="mb-2 inline-block text-[11px] font-medium leading-[1.3] tracking-[0.06em] uppercase text-[#F4A261]"
            >
              ГЕМАТОЛОГИЧЕСКИЕ
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-heading text-[28px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#E8ECF0] mb-6"
            >
              Гематологические имитаторы
            </motion.h2>
          </motion.div>

          {/* Two cards side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sickle Cell Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={cardSlideLeft}
              className="rounded-[10px] border border-[#25303D] bg-[#111820] overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)', borderLeft: '3px solid #F4A261' }}
            >
              <div className="p-6" style={{ boxShadow: '0 0 16px rgba(244,162,97,0.06)' }}>
                <h3 className="font-heading text-[22px] font-semibold leading-[1.3] text-[#F4A261] mb-3">
                  Вазоокклюзивный криз при серповидно-клеточной анемии
                </h3>

                <p className="text-sm leading-[1.55] text-[#94A3B8] mb-4">
                  Острая боль в животе, тошнота, лихорадка — часто ложно диагностируется как острый аппендицит или панкреатит. До 30% ненужных операций.
                </p>

                {/* Table */}
                <div className="mb-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#19202A]">
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                          Признак
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#F4A261]">
                          СКА-криз
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                          Хирургический живот
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#25303D]">
                      {[
                        ['HbS', '> 50%', 'Отсутствует'],
                        ['Hb', '↓↓', 'Норма / ↓'],
                        ['Ретикулоциты', '↑↑', 'Норма'],
                        ['ЛДГ', '↑↑', '↑'],
                        ['Билирубин', '↑ (непрямой)', 'Норма'],
                        ['Лейкоциты', '↑', '↑'],
                        ['PCT', 'Норма', '↑↑'],
                        ['Анамнез', 'Известная СКА', 'Нет'],
                      ].map(([sign, sca, surgical], idx) => (
                        <motion.tr
                          key={sign}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: idx * 0.04, ease: easeOutExpo }}
                          className="hover:bg-[#19202A]/50 transition-colors duration-150"
                        >
                          <td className="px-3 py-2 text-[#E8ECF0] font-medium">{sign}</td>
                          <td className="px-3 py-2 text-[#F4A261] font-mono-data">{sca}</td>
                          <td className="px-3 py-2 text-[#94A3B8] font-mono-data">{surgical}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Key discriminator */}
                <div
                  className="mb-4 rounded-lg border border-[#F4A261]/20 bg-[#F4A261]/5 p-4"
                  style={{ boxShadow: '0 0 16px rgba(244,162,97,0.06)' }}
                >
                  <p className="text-sm leading-[1.55] text-[#E8ECF0]">
                    <span className="font-semibold text-[#F4A261]">Анамнез СКА — решающий.</span> При известной СКА: PCT нормальный → скорее всего вазоокклюзивный криз. PCT ↑ → возможен сепсис (сальмонелла!)
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-[#4ECDC4]" />
                  <p className="text-sm leading-[1.55] text-[#94A3B8]">
                    <span className="text-[#4ECDC4] font-semibold">Действие:</span>{' '}
                    1. Анамнез + гемоглобинопатия | 2. PCT | 3. При ↑ PCT — кровевые культуры (Salmonella spp. — специфичный патоген СКА)
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Porphyria Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={cardSlideRight}
              className="rounded-[10px] border border-[#25303D] bg-[#111820] overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)', borderLeft: '3px solid #F4A261' }}
            >
              <div className="p-6" style={{ boxShadow: '0 0 16px rgba(244,162,97,0.06)' }}>
                <h3 className="font-heading text-[22px] font-semibold leading-[1.3] text-[#F4A261] mb-3">
                  Острая интермиттирующая порфирия
                </h3>

                <p className="text-sm leading-[1.55] text-[#94A3B8] mb-4">
                  Острая колющая боль в животе, тахикардия, гипертензия, психические расстройства — «хирургический» живот с нормальной брюшной стенкой.
                </p>

                {/* Table */}
                <div className="mb-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#19202A]">
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                          Признак
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#F4A261]">
                          Порфирия
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                          Хирургический живот
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#25303D]">
                      {[
                        ['Порфобилиноген (моча)', '↑↑↑', 'Норма'],
                        ['Δ-ALA (моча)', '↑↑', 'Норма'],
                        ['Цвет мочи', 'Тёмная при постоянстве', 'Норма'],
                        ['Брюшная стенка', 'Мягкая', 'Напряжена'],
                        ['Психические симптомы', 'Часто', 'Нет'],
                        ['PCT', 'Норма', '↑↑'],
                        ['CRP', '< 50', '↑↑'],
                      ].map(([sign, porphyria, surgical], idx) => (
                        <motion.tr
                          key={sign}
                          initial={{ opacity: 0, x: 8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: idx * 0.04, ease: easeOutExpo }}
                          className="hover:bg-[#19202A]/50 transition-colors duration-150"
                        >
                          <td className="px-3 py-2 text-[#E8ECF0] font-medium">{sign}</td>
                          <td className="px-3 py-2 text-[#F4A261] font-mono-data">{porphyria}</td>
                          <td className="px-3 py-2 text-[#94A3B8] font-mono-data">{surgical}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Key discriminator */}
                <div
                  className="mb-4 rounded-lg border border-[#F4A261]/20 bg-[#F4A261]/5 p-4"
                  style={{ boxShadow: '0 0 16px rgba(244,162,97,0.06)' }}
                >
                  <p className="text-sm leading-[1.55] text-[#E8ECF0]">
                    <span className="font-semibold text-[#F4A261]">Мягкое брюшко + тёмная моча + психические симптомы</span> — классическая триада порфирии. Порфобилиноген в моче — золотой стандарт диагностики.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-[#4ECDC4]" />
                  <p className="text-sm leading-[1.55] text-[#94A3B8]">
                    <span className="text-[#4ECDC4] font-semibold">Действие:</span>{' '}
                    Подозрение → моча на порфобилиноген + Δ-ALA → при положительном: глюкоза в/в, гемин — НЕ барбитураты
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== SECTION 4: CARDIOTHORACIC MIMICS ====== */}
      <section
        id={sectionRefs.cardiothoracic}
        ref={cardiothoracicRef}
        className="border-t border-[#25303D] bg-[#111820]"
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="mb-2 inline-block text-[11px] font-medium leading-[1.3] tracking-[0.06em] uppercase text-[#4A90D9]"
            >
              КАРДИОТОРАКАЛЬНЫЕ
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-heading text-[28px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#E8ECF0] mb-6"
            >
              Кардиоторакальные имитаторы
            </motion.h2>
          </motion.div>

          {/* Three cards in a row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Inferior MI */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
              className="rounded-[10px] border border-[#25303D] bg-[#111820] overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)', borderLeft: '3px solid #E84545' }}
            >
              <div className="p-6" style={{ boxShadow: '0 0 16px rgba(232,69,69,0.08)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-5 w-5 text-[#E84545]" />
                  <h3 className="font-heading text-[22px] font-semibold leading-[1.3] text-[#E84545]">
                    ИМ нижней стенки
                  </h3>
                </div>

                <p className="text-sm leading-[1.55] text-[#94A3B8] mb-4">
                  Боль в эпигастрии, тошнота, рвота — 10–15% ИМ нижней стенки маскируются под «желудочный» живот.
                </p>

                <div
                  className="mb-4 rounded-lg border border-[#E84545]/20 bg-[#E84545]/5 p-4"
                  style={{ boxShadow: '0 0 16px rgba(232,69,69,0.06)' }}
                >
                  <p className="text-sm leading-[1.55] text-[#E8ECF0]">
                    <span className="font-semibold text-[#E84545]">Ключевые находки:</span>{' '}
                    Тропонин I/T ↑↑, ЭКГ: ST ↑ II, III, aVF. Брюшная стенка мягкая.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-[#4ECDC4]" />
                  <p className="text-sm leading-[1.55] text-[#94A3B8]">
                    <span className="text-[#4ECDC4] font-semibold">Действие:</span>{' '}
                    ЭКГ в первые 10 минут → тропонин. Нормальная ЭКГ ИСКЛЮЧАЕТ ИМ в {'>'} 95%.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Pulmonary Embolism */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.1 }}
              className="rounded-[10px] border border-[#25303D] bg-[#111820] overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)', borderLeft: '3px solid #F4A261' }}
            >
              <div className="p-6" style={{ boxShadow: '0 0 16px rgba(244,162,97,0.06)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Wind className="h-5 w-5 text-[#F4A261]" />
                  <h3 className="font-heading text-[22px] font-semibold leading-[1.3] text-[#F4A261]">
                    ТЭЛА
                  </h3>
                </div>

                <p className="text-sm leading-[1.55] text-[#94A3B8] mb-4">
                  Острая боль в подложечной области, диспноэ, тахикардия — может имитировать острый холецистит или панкреатит.
                </p>

                <div
                  className="mb-4 rounded-lg border border-[#F4A261]/20 bg-[#F4A261]/5 p-4"
                  style={{ boxShadow: '0 0 16px rgba(244,162,97,0.06)' }}
                >
                  <p className="text-sm leading-[1.55] text-[#E8ECF0]">
                    <span className="font-semibold text-[#F4A261]">Ключевые находки:</span>{' '}
                    D-димер ↑↑↑, гипоксемия, синусовая тахикардия, S1Q3T3 на ЭКГ.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-[#4ECDC4]" />
                  <p className="text-sm leading-[1.55] text-[#94A3B8]">
                    <span className="text-[#4ECDC4] font-semibold">Действие:</span>{' '}
                    D-димер + ЭКГ + КТ-ангиография лёгочных артерий при подтверждённой гипоксемии.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Aortic Dissection */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.2 }}
              className="rounded-[10px] border border-[#25303D] bg-[#111820] overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)', borderLeft: '3px solid #E84545' }}
            >
              <div className="p-6" style={{ boxShadow: '0 0 16px rgba(232,69,69,0.08)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-[#E84545]" />
                  <h3 className="font-heading text-[22px] font-semibold leading-[1.3] text-[#E84545]">
                    Диссекция / разрыв аорты
                  </h3>
                </div>

                <p className="text-sm leading-[1.55] text-[#94A3B8] mb-4">
                  Острая «кинжальная» боль в спине / животе — может имитировать любую форму острого живота.
                </p>

                <div
                  className="mb-4 rounded-lg border border-[#E84545]/20 bg-[#E84545]/5 p-4"
                  style={{ boxShadow: '0 0 16px rgba(232,69,69,0.06)' }}
                >
                  <p className="text-sm leading-[1.55] text-[#E8ECF0]">
                    <span className="font-semibold text-[#E84545]">Ключевые находки:</span>{' '}
                    Разница АД между конечностями {'>'} 20 мм рт.ст., неврологический дефицит, КТ-ангиография — золотой стандарт.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-[#4ECDC4]" />
                  <p className="text-sm leading-[1.55] text-[#94A3B8]">
                    <span className="text-[#4ECDC4] font-semibold">Действие:</span>{' '}
                    КТ-ангиография аорты с контрастом — НЕ ждите лабораторные данные.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== SECTION 5: EXCLUSION ALGORITHM ====== */}
      <section
        id={sectionRefs.algorithm}
        ref={algorithmRef}
        className="border-t border-[#25303D]"
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="mb-2 inline-block text-[11px] font-medium leading-[1.3] tracking-[0.06em] uppercase text-[#4ECDC4]"
            >
              АЛГОРИТМ ИСКЛЮЧЕНИЯ
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-heading text-[28px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#E8ECF0] mb-2"
            >
              Алгоритм исключения масок острого живота
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-sm font-normal leading-[1.55] text-[#94A3B8] mb-8 max-w-[720px]"
            >
              Пошаговый протокол исключения нехирургических имитаторов перед постановкой диагноза перитонита.
            </motion.p>
          </motion.div>

          {/* Decision tree */}
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-[23px] top-[48px] bottom-[48px] w-[2px] bg-[#25303D] hidden md:block" />

            <div className="space-y-4">
              {algorithmSteps.map((step, idx) => {
                const isExpanded = expandedStep === step.id;
                const isCompleted = completedSteps.has(step.id);
                const isLast = idx === algorithmSteps.length - 1;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, ease: easeOutExpo, delay: idx * 0.1 }}
                    className="relative"
                  >
                    {/* Step node */}
                    <button
                      onClick={() => toggleStep(step.id)}
                      className={
                        'w-full text-left rounded-[10px] border bg-[#19202A] transition-all duration-200 cursor-pointer hover:border-[#4ECDC4]/50 group ' +
                        (isExpanded ? 'border-[#4ECDC4]' : 'border-[#25303D]')
                      }
                    >
                      <div className="flex items-center gap-4 p-4 md:p-5">
                        {/* Step number circle */}
                        <div
                          className={
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-mono-data text-lg font-medium transition-colors duration-200 ' +
                            (isCompleted
                              ? 'border-[#4ECDC4] bg-[#4ECDC4]/15 text-[#4ECDC4]'
                              : 'border-[#25303D] bg-[#111820] text-[#94A3B8] group-hover:border-[#4ECDC4]/40')
                          }
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-[#4ECDC4]" />
                          ) : (
                            step.id
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[#4ECDC4]">{step.icon}</span>
                            <span className="text-sm font-semibold text-[#E8ECF0]">
                              {step.title}
                            </span>
                          </div>
                          <p className="text-xs text-[#94A3B8] mt-0.5">{step.test}</p>
                        </div>

                        {/* Expand toggle */}
                        <div className="flex items-center gap-3">
                          {isLast ? (
                            <span className="hidden sm:inline-flex items-center rounded-full bg-[#2A9D8F]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#2A9D8F] border border-[#2A9D8F]/30">
                              Финал
                            </span>
                          ) : (
                            <span className="hidden sm:inline-flex items-center rounded-full bg-[#4ECDC4]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#4ECDC4] border border-[#4ECDC4]/20">
                              Шаг {step.id}
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-[#5E6E80]" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-[#5E6E80]" />
                          )}
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: easeOutExpo }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[#25303D] px-4 pb-5 md:px-5">
                              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Detail */}
                                <div className="rounded-lg bg-[#111820] border border-[#25303D] p-4">
                                  <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#5E6E80] mb-2">
                                    Описание
                                  </h4>
                                  <p className="text-sm leading-[1.55] text-[#94A3B8]">
                                    {step.detail}
                                  </p>
                                </div>

                                {/* Criteria */}
                                <div className="grid grid-cols-1 gap-3">
                                  <div className="rounded-lg border border-[#2A9D8F]/20 bg-[#2A9D8F]/5 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <CheckCircle2 className="h-4 w-4 text-[#2A9D8F]" />
                                      <span className="text-xs font-semibold text-[#2A9D8F]">
                                        Норма → {step.normalNext ?? 'Перитонит вероятен'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[#94A3B8]">
                                      {step.normalCriteria}
                                    </p>
                                  </div>

                                  <div className="rounded-lg border border-[#E84545]/20 bg-[#E84545]/5 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <XCircle className="h-4 w-4 text-[#E84545]" />
                                      <span className="text-xs font-semibold text-[#E84545]">
                                        Патология → {step.abnormalResult}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[#94A3B8]">
                                      {step.abnormalCriteria}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Action */}
                              <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#4ECDC4]/20 bg-[#4ECDC4]/5 p-4">
                                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#4ECDC4]" />
                                <div>
                                  <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4ECDC4]">
                                    Действие
                                  </span>
                                  <p className="text-sm leading-[1.55] text-[#E8ECF0] mt-1">
                                    {step.action}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Final result node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.7 }}
              className="mt-6 rounded-[10px] border border-[#2A9D8F]/30 bg-[#2A9D8F]/5 p-5 text-center"
              style={{ boxShadow: '0 0 20px rgba(42,157,143,0.1)' }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <HelpCircle className="h-5 w-5 text-[#2A9D8F]" />
                <span className="font-heading text-lg font-semibold text-[#2A9D8F]">
                  Перитонит вероятен
                </span>
              </div>
              <p className="text-sm text-[#94A3B8]">
                Все маски исключены. Рассмотрите хирургический острый живот, уточните локализацию.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== SECTION 6: MASTER COMPARISON CHEAT SHEET ====== */}
      <section
        ref={cheatSheetRef}
        className="border-t border-[#25303D] bg-[#111820]"
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6"
          >
            <div>
              <motion.h2
                variants={fadeUp}
                custom={0}
                className="font-heading text-[22px] font-semibold leading-[1.3] text-[#E8ECF0] mb-2"
              >
                Шпаргалка: маски vs перитонит
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={1}
                className="text-sm font-normal leading-[1.55] text-[#94A3B8]"
              >
                Сводная таблица для быстрого сравнения всех масок с типичным перитонитом.
              </motion.p>
            </div>
            <motion.button
              variants={fadeUp}
              custom={2}
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-[#4ECDC4]/30 bg-transparent px-4 py-2 text-sm font-medium text-[#4ECDC4] hover:bg-[#4ECDC4]/10 transition-colors duration-150 cursor-pointer self-start sm:self-auto"
            >
              <Printer className="h-4 w-4" />
              Распечатать шпаргалку
            </motion.button>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="overflow-x-auto rounded-[10px] border border-[#25303D] bg-[#111820]"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
          >
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-[#19202A]">
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                    Маска
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                    Ключевой тест
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                    Ключевой отличительный признак
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                    PCT
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                    CRP
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.06em] uppercase text-[#5E6E80]">
                    Срочность
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#25303D]">
                {cheatSheetData.map((row, idx) => (
                  <motion.tr
                    key={row.mask}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, ease: easeOutExpo, delay: idx * 0.04 }}
                    className="hover:bg-[#19202A]/50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => scrollToSection(row.linkId)}
                        className="font-semibold text-[#E8ECF0] hover:text-[#4ECDC4] transition-colors duration-150 cursor-pointer text-left"
                      >
                        {row.mask}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8]">{row.keyTest}</td>
                    <td className="px-4 py-3 text-[#94A3B8] max-w-[280px]">{row.keySign}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-[#E8ECF0]">{row.pct}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-data text-[#E8ECF0]">{row.crp}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border"
                        style={{
                          backgroundColor: `${row.urgencyColor}15`,
                          color: row.urgencyColor,
                          borderColor: `${row.urgencyColor}30`,
                        }}
                      >
                        {row.urgency}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Quick legend */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.3 }}
            className="mt-6 flex flex-wrap gap-4 text-xs text-[#5E6E80]"
          >
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#E84545]" />
              <span>Критическая — немедленное вмешательство</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#F4A261]" />
              <span>Высокая — срочная диагностика</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#E9C46A]" />
              <span>Средняя — плановая диагностика</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== BOTTOM SPACER ====== */}
      <div className="h-16" />
    </div>
  );
}
